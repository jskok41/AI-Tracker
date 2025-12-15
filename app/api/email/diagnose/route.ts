import { NextResponse } from 'next/server';

/**
 * Email Configuration Diagnostic Endpoint
 * 
 * This endpoint helps diagnose email configuration issues without exposing sensitive data.
 * Accessible at: /api/email/diagnose
 */
export async function GET() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;

  const diagnostics = {
    status: 'unknown' as 'configured' | 'missing' | 'invalid',
    issues: [] as string[],
    configuration: {
      hasHost: !!host,
      hasPort: !!port,
      hasUser: !!user,
      hasPass: !!pass,
      hasFrom: !!from,
      host: host || null,
      port: port || null,
      user: user ? (user.includes('@') ? user.split('@')[0] + '@***' : '***') : null,
      passwordLength: pass ? pass.length : 0,
      from: from || null,
    },
    recommendations: [] as string[],
  };

  // Check if all required variables are present
  if (!host || !port || !user || !pass) {
    diagnostics.status = 'missing';
    diagnostics.issues.push('Missing required environment variables');
    
    if (!host) diagnostics.issues.push('EMAIL_SERVER_HOST is not set');
    if (!port) diagnostics.issues.push('EMAIL_SERVER_PORT is not set');
    if (!user) diagnostics.issues.push('EMAIL_SERVER_USER is not set');
    if (!pass) diagnostics.issues.push('EMAIL_SERVER_PASSWORD is not set');
    
    diagnostics.recommendations.push('Set all required email environment variables in Vercel');
    diagnostics.recommendations.push('Go to: Vercel Dashboard → Your Project → Settings → Environment Variables');
  } else {
    diagnostics.status = 'configured';
    
    // Validate Gmail-specific requirements
    const isGmail = host.includes('gmail.com');
    if (isGmail) {
      // Check if user is full email
      if (!user.includes('@')) {
        diagnostics.status = 'invalid';
        diagnostics.issues.push('EMAIL_SERVER_USER should be full Gmail address (e.g., your-email@gmail.com)');
        diagnostics.recommendations.push('Update EMAIL_SERVER_USER to your full Gmail address');
      }
      
      // Check password length (App Passwords are typically 16 chars)
      if (pass.length !== 16 && pass.length !== 20) {
        diagnostics.status = 'invalid';
        diagnostics.issues.push(`Gmail App Password should be 16 characters, but current password is ${pass.length} characters`);
        diagnostics.recommendations.push('Generate a new Gmail App Password at: https://myaccount.google.com/apppasswords');
        diagnostics.recommendations.push('Make sure you\'re using an App Password, not your regular Gmail password');
      }
      
      // Check port
      const portNum = parseInt(port);
      if (portNum !== 587 && portNum !== 465) {
        diagnostics.issues.push(`Gmail typically uses port 587 (STARTTLS) or 465 (SSL), but port ${portNum} is configured`);
      }
    }
  }

  // Add general recommendations
  if (diagnostics.status === 'configured' || diagnostics.status === 'invalid') {
    diagnostics.recommendations.push('After updating environment variables, redeploy your Vercel project');
    diagnostics.recommendations.push('Check Vercel deployment logs for detailed error messages');
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
