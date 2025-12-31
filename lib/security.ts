/**
 * Security utilities to protect against RCE, XSS, and injection attacks
 * Specifically addresses CVE-2025-21262 (React Server Components RCE)
 */

import { z } from 'zod';

// Maximum allowed payload size for server actions (2MB)
const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024;

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  // Remove potential code injection patterns
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
    .replace(/eval\(/gi, '') // Remove eval calls
    .replace(/Function\(/gi, '') // Remove Function constructor
    .trim();
}

/**
 * Validate that FormData doesn't contain malicious payloads
 */
export function validateFormData(formData: FormData): boolean {
  let totalSize = 0;
  
  for (const [key, value] of formData.entries()) {
    // Check key is safe
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      console.error('[Security] Invalid FormData key:', key);
      return false;
    }
    
    // Check value size
    if (typeof value === 'string') {
      totalSize += value.length;
      
      // Check for suspicious patterns in string values
      if (containsSuspiciousPatterns(value)) {
        console.error('[Security] Suspicious pattern detected in FormData');
        return false;
      }
    } else if (value instanceof File) {
      totalSize += value.size;
    }
    
    // Check total size doesn't exceed limit
    if (totalSize > MAX_PAYLOAD_SIZE) {
      console.error('[Security] FormData exceeds size limit');
      return false;
    }
  }
  
  return true;
}

/**
 * Check for suspicious patterns that might indicate RCE attempts
 */
function containsSuspiciousPatterns(value: string): boolean {
  const suspiciousPatterns = [
    /__proto__/i,
    /constructor/i,
    /prototype/i,
    /\$\{.*\}/,  // Template literal injection
    /require\(/,
    /import\(/,
    /process\./,
    /child_process/,
    /fs\./,
    /eval\(/,
    /Function\(/,
    /setTimeout\(/,
    /setInterval\(/,
    /new Function/,
    /\.\.\//,  // Path traversal
    /~\//,     // Home directory access
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(value));
}

/**
 * Validate object doesn't contain prototype pollution attempts
 */
export function validateObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return true;
  }
  
  // Check for prototype pollution keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) {
      console.error('[Security] Prototype pollution attempt detected');
      return false;
    }
    
    // Recursively check nested objects
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (!validateObject(obj[key])) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Safely extract and validate FormData fields
 */
export function safeFormDataExtract(
  formData: FormData,
  schema: z.ZodSchema
): { success: true; data: any } | { success: false; error: string } {
  try {
    // First validate the FormData itself
    if (!validateFormData(formData)) {
      return { success: false, error: 'Invalid or malicious FormData detected' };
    }
    
    // Convert FormData to object
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = sanitizeString(value);
      } else {
        data[key] = value;
      }
    }
    
    // Validate against schema
    const validated = schema.parse(data);
    
    // Final validation check
    if (!validateObject(validated)) {
      return { success: false, error: 'Object validation failed' };
    }
    
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Validate file uploads
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }
  
  // Check for suspicious file names
  if (containsSuspiciousPatterns(file.name)) {
    return {
      valid: false,
      error: 'Suspicious file name detected',
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize URL to prevent SSRF attacks
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Prevent access to local/private networks
    const hostname = parsed.hostname.toLowerCase();
    const privatePatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];
    
    if (privatePatterns.some(pattern => pattern.test(hostname))) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Create secure headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, max-age=0',
  };
}
