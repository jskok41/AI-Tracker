import nodemailer from 'nodemailer';

// Check if email configuration is available
function getEmailTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !port || !user || !pass) {
    console.error('Email configuration missing:', {
      hasHost: !!host,
      hasPort: !!port,
      hasUser: !!user,
      hasPass: !!pass,
    });
    return null;
  }

  const portNum = parseInt(port);
  const isGmail = host.includes('gmail.com');
  
  // Log configuration (without exposing password)
  console.log('Email configuration:', {
    host,
    port: portNum,
    user,
    passwordLength: pass.length,
    isGmail,
  });

  // Validate Gmail configuration
  if (isGmail) {
    if (!user.includes('@')) {
      console.error('ERROR: EMAIL_SERVER_USER should be full Gmail address (e.g., your-email@gmail.com), got:', user);
    }
    if (pass.length !== 16 && pass.length !== 20) {
      console.warn('WARNING: Gmail App Password should be 16 characters. Current length:', pass.length);
      console.warn('If using regular password, it will fail. Generate App Password at: https://myaccount.google.com/apppasswords');
    }
  }
  
  // Gmail-specific configuration
  const transporterConfig: any = {
    host,
    port: portNum,
    secure: portNum === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user,
      pass,
    },
  };

  // For Gmail on port 587, ensure TLS is required
  if (isGmail && portNum === 587) {
    transporterConfig.requireTLS = true;
  }

  return nodemailer.createTransport(transporterConfig);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || 'noreply@example.com';

  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured. Please set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, and EMAIL_SERVER_PASSWORD environment variables.');
    throw new Error('Email service is not configured. Please contact support.');
  }

  try {
    // Verify transporter configuration
    console.log('Verifying email transporter connection...');
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    const info = await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'Reset Your Password - AI Benefits Tracker',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password for AI Benefits Tracker.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <div class="footer">
                <p>AI Benefits Tracker</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Reset Your Password\n\nYou requested to reset your password for AI Benefits Tracker.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    });

    console.log('Password reset email sent successfully:', {
      messageId: info.messageId,
      to: email,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send password reset email:', {
      error: error.message,
      code: error.code,
      response: error.response,
      to: email,
    });
    
    // Provide more helpful error messages for common Gmail issues
    let errorMessage = error.message || 'Unknown error';
    
    if (error.responseCode === 535 || error.message?.includes('535') || error.message?.includes('BadCredentials')) {
      errorMessage = 'Invalid email credentials. Please check your EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables. For Gmail, make sure you\'re using an App Password (not your regular password). See: https://support.google.com/mail/?p=BadCredentials';
    } else if (error.message?.includes('EAUTH')) {
      errorMessage = 'Authentication failed. Please verify your email credentials are correct.';
    } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Could not connect to email server. Please check EMAIL_SERVER_HOST and EMAIL_SERVER_PORT settings.';
    }
    
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || 'noreply@example.com';
  const loginUrl = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/login`;
  
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured. Please set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, and EMAIL_SERVER_PASSWORD environment variables.');
    throw new Error('Email service is not configured. Please contact support.');
  }

  try {
    await transporter.verify();
    
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'Welcome to AI Benefits Tracker',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to AI Benefits Tracker, ${name}!</h2>
              <p>Your account has been successfully created.</p>
              <p>You can now start tracking AI benefits across your organization.</p>
              <a href="${loginUrl}" class="button">Go to Login</a>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    
    // Provide more helpful error messages for common Gmail issues
    let errorMessage = error.message || 'Unknown error';
    
    if (error.responseCode === 535 || error.message?.includes('535') || error.message?.includes('BadCredentials')) {
      errorMessage = 'Invalid email credentials. Please check your EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables. For Gmail, make sure you\'re using an App Password (not your regular password). See: https://support.google.com/mail/?p=BadCredentials';
    } else if (error.message?.includes('EAUTH')) {
      errorMessage = 'Authentication failed. Please verify your email credentials are correct.';
    } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Could not connect to email server. Please check EMAIL_SERVER_HOST and EMAIL_SERVER_PORT settings.';
    }
    
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

