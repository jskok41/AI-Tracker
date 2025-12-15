#!/usr/bin/env tsx
/**
 * Test Email Configuration Script
 * 
 * This script tests your email configuration to help diagnose SMTP issues.
 * 
 * Usage:
 *   npx tsx scripts/test-email-config.ts
 * 
 * Make sure your .env.local file has the email configuration set up.
 */

import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testEmailConfig() {
  console.log('🔍 Testing Email Configuration...\n');

  // Check environment variables
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM || user;

  console.log('📋 Environment Variables:');
  console.log(`   EMAIL_SERVER_HOST: ${host || '❌ NOT SET'}`);
  console.log(`   EMAIL_SERVER_PORT: ${port || '❌ NOT SET'}`);
  console.log(`   EMAIL_SERVER_USER: ${user || '❌ NOT SET'}`);
  console.log(`   EMAIL_SERVER_PASSWORD: ${pass ? '✅ SET (' + pass.length + ' chars)' : '❌ NOT SET'}`);
  console.log(`   EMAIL_FROM: ${from || '❌ NOT SET'}`);
  console.log('');

  // Validate all required variables are present
  if (!host || !port || !user || !pass) {
    console.error('❌ ERROR: Missing required environment variables!');
    console.error('\nPlease set the following in your .env.local file:');
    console.error('   EMAIL_SERVER_HOST=smtp.gmail.com');
    console.error('   EMAIL_SERVER_PORT=587');
    console.error('   EMAIL_SERVER_USER=your-email@gmail.com');
    console.error('   EMAIL_SERVER_PASSWORD=your-app-password');
    process.exit(1);
  }

  // Validate Gmail-specific requirements
  if (host.includes('gmail.com')) {
    console.log('📧 Gmail Configuration Detected');
    
    // Check if using App Password format (16 characters, no spaces)
    if (pass.length !== 16 && pass.length !== 20) {
      console.warn('⚠️  WARNING: Gmail App Passwords are typically 16 characters.');
      console.warn('   If you\'re using a regular password, it won\'t work!');
      console.warn('   Generate an App Password at: https://myaccount.google.com/apppasswords');
    }
    
    // Check if user is full email
    if (!user.includes('@')) {
      console.error('❌ ERROR: EMAIL_SERVER_USER should be your full Gmail address (e.g., your-email@gmail.com)');
      process.exit(1);
    }
    
    console.log('');
  }

  // Create transporter
  const portNum = parseInt(port);
  const isGmail = host.includes('gmail.com');
  
  const transporterConfig: any = {
    host,
    port: portNum,
    secure: portNum === 465,
    auth: {
      user,
      pass,
    },
  };

  if (isGmail && portNum === 587) {
    transporterConfig.requireTLS = true;
  }

  console.log('🔧 Transporter Configuration:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${portNum}`);
  console.log(`   Secure: ${transporterConfig.secure}`);
  console.log(`   Require TLS: ${transporterConfig.requireTLS || false}`);
  console.log('');

  const transporter = nodemailer.createTransport(transporterConfig);

  // Test connection
  console.log('🔌 Testing SMTP Connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS\n');
  } catch (error: any) {
    console.error('❌ SMTP Connection: FAILED\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    
    if (error.responseCode === 535 || error.message?.includes('535') || error.message?.includes('BadCredentials')) {
      console.error('\n🔴 AUTHENTICATION ERROR DETECTED');
      console.error('\nThis means your EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD is incorrect.');
      console.error('\nFor Gmail, make sure:');
      console.error('   1. You\'re using an App Password (not your regular password)');
      console.error('   2. 2-Step Verification is enabled on your Google account');
      console.error('   3. Generate a new App Password at: https://myaccount.google.com/apppasswords');
      console.error('   4. EMAIL_SERVER_USER is your full Gmail address (e.g., your-email@gmail.com)');
      console.error('   5. EMAIL_SERVER_PASSWORD is the 16-character App Password (no spaces)');
    } else if (error.message?.includes('EAUTH')) {
      console.error('\n🔴 AUTHENTICATION FAILED');
      console.error('Please verify your credentials are correct.');
    } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED')) {
      console.error('\n🔴 CONNECTION FAILED');
      console.error('Could not connect to the email server.');
      console.error('Check EMAIL_SERVER_HOST and EMAIL_SERVER_PORT settings.');
    }
    
    process.exit(1);
  }

  // Test sending email (optional - comment out if you don't want to send a test email)
  console.log('📨 Testing Email Send...');
  console.log('   (Skipping actual send - uncomment code below to test sending)');
  
  /*
  try {
    const testEmail = process.env.TEST_EMAIL || user;
    const info = await transporter.sendMail({
      from: from,
      to: testEmail,
      subject: 'Test Email from AI Benefits Tracker',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: '<p>This is a test email to verify your email configuration is working correctly.</p>',
    });
    console.log('✅ Email Send: SUCCESS');
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error('❌ Email Send: FAILED');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
  */

  console.log('\n✅ All tests passed! Your email configuration looks good.');
  console.log('\n💡 Next steps:');
  console.log('   1. Make sure these environment variables are set in your deployment (Vercel)');
  console.log('   2. Restart your server/redeploy after setting environment variables');
  console.log('   3. Try the password reset flow again');
}

testEmailConfig().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
