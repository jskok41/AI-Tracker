'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.string().optional(),
  departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Register new user
export async function register(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = formData.get('role');
    let departmentId = formData.get('departmentId');
    
    // Convert "none" to empty string for optional department
    if (departmentId === 'none' || departmentId === '') {
      departmentId = null;
    }

    // Validate required fields exist
    if (!name || !email || !password || !confirmPassword) {
      return { 
        success: false, 
        error: 'All required fields (name, email, password, confirm password) must be filled' 
      };
    }

    // Convert to strings and validate they're not empty
    const nameStr = String(name).trim();
    const emailStr = String(email).trim().toLowerCase();
    const passwordStr = String(password);
    const confirmPasswordStr = String(confirmPassword);

    if (!nameStr || !emailStr || !passwordStr || !confirmPasswordStr) {
      return { success: false, error: 'All required fields must have valid values' };
    }

    // Normalize optional fields
    const normalizedRole = role && String(role).trim() ? String(role).trim() : undefined;
    const normalizedDepartmentId = departmentId && String(departmentId).trim() && String(departmentId).trim() !== 'none' 
      ? String(departmentId).trim() 
      : undefined;

    const data = {
      name: nameStr,
      email: emailStr,
      password: passwordStr,
      confirmPassword: confirmPasswordStr,
      role: normalizedRole,
      departmentId: normalizedDepartmentId,
    };

    // Validate with Zod schema
    const validated = registerSchema.parse(data);

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      return { 
        success: false, 
        error: 'Database connection error. Please check your database configuration.' 
      };
    }

    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(validated.password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return { success: false, error: 'Failed to process password. Please try again.' };
    }

    // Prepare user data
    const userData: any = {
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
    };

    if (validated.role) {
      userData.role = validated.role;
    }

    if (validated.departmentId) {
      // Verify department exists if provided
      try {
        const department = await prisma.department.findUnique({
          where: { id: validated.departmentId },
        });
        if (!department) {
          return { success: false, error: 'Selected department does not exist' };
        }
        userData.departmentId = validated.departmentId;
      } catch (deptError) {
        console.error('Department lookup error:', deptError);
        // If department lookup fails, just skip it
        console.warn('Skipping department assignment due to error');
      }
    }

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: userData,
      });
    } catch (createError: any) {
      console.error('User creation error:', createError);
      
      // Handle specific Prisma errors
      if (createError.code === 'P2002') {
        return { success: false, error: 'An account with this email already exists' };
      }
      if (createError.code === 'P2003') {
        return { success: false, error: 'Invalid department selected' };
      }
      if (createError.code === 'P1001') {
        return { success: false, error: 'Cannot reach database server. Please check your connection.' };
      }
      
      throw createError; // Re-throw to be caught by outer catch
    }

    return { success: true, data: user };
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      const field = firstError.path.join('.') || 'field';
      return { 
        success: false, 
        error: `${field}: ${firstError.message}` 
      };
    }
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message?: string };
      switch (prismaError.code) {
        case 'P2002':
          return { success: false, error: 'An account with this email already exists' };
        case 'P2003':
          return { success: false, error: 'Invalid department selected' };
        case 'P1001':
          return { success: false, error: 'Cannot reach database server. Please check your database connection.' };
        case 'P1000':
          return { success: false, error: 'Database authentication failed. Please check your database credentials.' };
        default:
          return { 
            success: false, 
            error: `Database error: ${prismaError.message || 'Unknown database error'}` 
          };
      }
    }
    
    // Handle generic Error objects
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate')) {
        return { success: false, error: 'An account with this email already exists' };
      }
      if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
        return { success: false, error: 'Database connection error. Please try again later.' };
      }
      if (errorMessage.includes('timeout')) {
        return { success: false, error: 'Request timed out. Please try again.' };
      }
      
      // For development, show the actual error. For production, show generic message.
      if (process.env.NODE_ENV === 'development') {
        return { success: false, error: `Registration failed: ${error.message}` };
      }
      
      return { 
        success: false, 
        error: 'Failed to register user. Please check your information and try again.' 
      };
    }
    
    // Handle unknown error types
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again or contact support if the problem persists.' 
    };
  }
}

// Login user
export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' };
        default:
          return { success: false, error: 'Something went wrong' };
      }
    }
    return { success: false, error: 'Failed to sign in' };
  }
}

// Request password reset
export async function requestPasswordReset(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
    };

    const validated = resetRequestSchema.parse(data);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { success: true, message: 'If an account exists with this email, you will receive a password reset link' };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: validated.email },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: validated.email,
        token: resetToken,
        expires,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(validated.email, resetToken);
      console.log('Password reset email sent successfully to:', validated.email);
    } catch (emailError: any) {
      console.error('Error sending password reset email:', emailError);
      // Still return success to user (security best practice - don't reveal if email exists)
      // But log the error for debugging
      return { 
        success: false, 
        error: emailError.message || 'Failed to send reset email. Please check your email configuration or contact support.' 
      };
    }

    return { success: true, message: 'If an account exists with this email, you will receive a password reset link' };
  } catch (error) {
    console.error('Password reset request error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to process reset request' };
  }
}

// Reset password with token
export async function resetPassword(formData: FormData) {
  try {
    const data = {
      token: formData.get('token') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validated = resetPasswordSchema.parse(data);

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validated.token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to reset password' };
  }
}

// Create new user (for use in forms)
export async function createUser(name: string, email: string, role?: string, departmentId?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: true, data: existingUser };
    }

    // Create user without password (they'll need to reset it)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        departmentId,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Failed to create user' };
  }
}

