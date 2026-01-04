const nodemailer = require('nodemailer');
const path = require('path');

// Email configuration from environment variables
// Helper function to safely parse boolean from environment variable
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseBoolean(process.env.SMTP_SECURE, false), // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Resend API key (alternative to SMTP)
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Create transporter
let transporter = null;
let emailServiceReady = false;
let useResend = false;

const initEmailService = () => {
  // Log current configuration (without sensitive data)
  console.log('📧 Initializing email service...');
  
  // Debug: Check if RESEND_API_KEY exists (even if empty)
  console.log('   RESEND_API_KEY check:', RESEND_API_KEY ? 'EXISTS (length: ' + RESEND_API_KEY.length + ')' : 'NOT SET');
  console.log('   RESEND_API_KEY type:', typeof RESEND_API_KEY);
  console.log('   RESEND_API_KEY value (first 10 chars):', RESEND_API_KEY ? RESEND_API_KEY.substring(0, 10) + '...' : 'undefined');
  
  // Check if Resend API key is available (preferred for Railway)
  if (RESEND_API_KEY && RESEND_API_KEY.trim().length > 0) {
    useResend = true;
    console.log('   Using Resend API (recommended for Railway)');
    console.log('   RESEND_API_KEY: ***SET***');
    emailServiceReady = true; // Resend doesn't need verification
    console.log('✅ Email service ready (Resend API)');
    return;
  }
  
  // Fallback to SMTP
  console.log('   Using SMTP (fallback)');
  console.log('   ⚠️  RESEND_API_KEY not found or empty - falling back to SMTP');
  console.log('   SMTP_HOST:', emailConfig.host);
  console.log('   SMTP_PORT:', emailConfig.port);
  console.log('   SMTP_SECURE:', emailConfig.secure);
  console.log('   SMTP_USER:', emailConfig.auth.user || 'NOT SET');
  console.log('   SMTP_PASS:', emailConfig.auth.pass ? '***SET***' : 'NOT SET');
  
  // Only initialize if email credentials are provided
  if (emailConfig.auth.user && emailConfig.auth.pass) {
    console.log('   ✓ Email credentials found, creating transporter...');
    
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates (for development)
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      debug: process.env.NODE_ENV === 'development', // Enable debug logging
      logger: process.env.NODE_ENV === 'development' // Enable logger
    });
    
    // Verify connection (async, but we don't wait for it)
    transporter.verify((error, success) => {
      if (error) {
        emailServiceReady = false;
        console.error('❌ Email service verification failed:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   SMTP Host:', emailConfig.host);
        console.error('   SMTP Port:', emailConfig.port);
        console.error('   SMTP Secure:', emailConfig.secure);
        console.error('   SMTP User:', emailConfig.auth.user);
        
        // Provide specific error guidance
        if (error.code === 'EAUTH') {
          console.error('   ⚠️  Authentication failed. Check your SMTP_USER and SMTP_PASS.');
          console.error('   For Gmail, make sure you\'re using an App Password, not your regular password.');
        } else if (error.code === 'ECONNECTION') {
          console.error('   ⚠️  Connection failed. Check your SMTP_HOST and SMTP_PORT.');
          console.error('   💡 Tip: Railway may block SMTP. Consider using Resend API instead (set RESEND_API_KEY).');
        } else if (error.code === 'ETIMEDOUT') {
          console.error('   ⚠️  Connection timeout. Check your network or firewall settings.');
          console.error('   💡 Tip: Railway may block SMTP. Consider using Resend API instead (set RESEND_API_KEY).');
        }
        
        console.warn('⚠️  Emails may not be sent. Please check your SMTP configuration.');
        console.warn('   💡 Recommended: Use Resend API (set RESEND_API_KEY) for better reliability on Railway.');
      } else {
        emailServiceReady = true;
        console.log('✅ Email service ready and verified');
        console.log('   SMTP Host:', emailConfig.host);
        console.log('   SMTP Port:', emailConfig.port);
        console.log('   SMTP Secure:', emailConfig.secure);
        console.log('   SMTP User:', emailConfig.auth.user);
      }
    });
  } else {
    console.warn('⚠️  Email service not configured. Set SMTP_USER and SMTP_PASS (or RESEND_API_KEY) in environment variables to enable emails.');
    console.warn('   Current SMTP_USER:', emailConfig.auth.user || 'NOT SET');
    console.warn('   Current SMTP_PASS:', emailConfig.auth.pass ? '***SET***' : 'NOT SET');
    console.warn('   Current RESEND_API_KEY:', RESEND_API_KEY ? '***SET***' : 'NOT SET');
    console.warn('   💡 Recommended: Use Resend API (set RESEND_API_KEY) for Railway deployments.');
    console.warn('   In development, reset links will be shown in the response instead.');
  }
};

// Send email using Resend API
const sendEmailViaResend = async (to, subject, html, text) => {
  try {
    let Resend;
    try {
      const resendModule = require('resend');
      // Resend package exports Resend as a named export
      Resend = resendModule.Resend;
      if (!Resend) {
        // Fallback: try default export or the module itself
        Resend = resendModule.default || resendModule;
      }
      if (!Resend || typeof Resend !== 'function') {
        console.error('❌ Resend class not found. Module exports:', Object.keys(resendModule));
        throw new Error('Resend class not found in module');
      }
    } catch (requireError) {
      console.error('❌ Failed to require resend package:', requireError);
      console.error('   Error stack:', requireError.stack);
      return { sent: false, error: 'Resend package not available: ' + requireError.message };
    }
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set');
      return { sent: false, error: 'RESEND_API_KEY is not configured' };
    }
    
    const resend = new Resend(RESEND_API_KEY);
    
    // Use Resend's default verified domain unless RESEND_FROM_EMAIL is explicitly set
    // Gmail addresses won't work unless the domain is verified in Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    console.log(`📧 Sending email via Resend API to: ${to}`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   Subject: ${subject}`);
    
    const { data, error } = await resend.emails.send({
      from: `Financial Planner <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text
    });
    
    if (error) {
      console.error('❌ Resend API error:', error);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a domain verification error
      if (error.statusCode === 403 && error.message && error.message.includes('only send testing emails')) {
        console.error('   ⚠️  Resend free tier limitation: Can only send to account owner email');
        console.error('   💡 Solution: Verify a domain at https://resend.com/domains to send to any recipient');
        return { 
          sent: false, 
          error: 'Resend free tier: Can only send to account owner. Please verify a domain at resend.com/domains',
          requiresDomainVerification: true
        };
      }
      
      return { sent: false, error: error.message || 'Resend API error' };
    }
    
    console.log(`✅ Email sent successfully via Resend to ${to}`);
    console.log(`   Message ID: ${data.id}`);
    return { sent: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    console.error('   Error stack:', error.stack);
    return { sent: false, error: error.message || 'Unknown error sending email' };
  }
};

// Send email function (supports both Resend and SMTP)
const sendEmail = async (to, subject, html, text) => {
  // Use Resend if API key is available (preferred for Railway)
  if (useResend && RESEND_API_KEY) {
    return await sendEmailViaResend(to, subject, html, text);
  }
  
  // Fallback to SMTP
  // If email service is not configured, return false
  if (!transporter) {
    console.error('❌ Cannot send email: Email service not configured');
    console.error('   Please set SMTP_USER and SMTP_PASS (or RESEND_API_KEY) in environment variables');
    console.error(`   Attempted to send to: ${to}`);
    console.error(`   Subject: ${subject}`);
    return { sent: false, error: 'Email service not configured' };
  }
  
  // Warn if email service verification hasn't completed yet (but still try to send)
  if (!emailServiceReady) {
    console.warn('⚠️  Email service verification not complete yet, but attempting to send email anyway...');
  }

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    const mailOptions = {
      from: `"Financial Planner" <${emailConfig.auth.user}>`,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error response:', error.response);
    console.error('   To:', to);
    console.error('   Subject:', subject);
    
    // Common error messages
    if (error.code === 'EAUTH') {
      console.error('   ⚠️  Authentication failed. Check your SMTP_USER and SMTP_PASS.');
    } else if (error.code === 'ECONNECTION') {
      console.error('   ⚠️  Connection failed. Check your SMTP_HOST and SMTP_PORT.');
      console.error('   💡 Tip: Railway may block SMTP. Use Resend API instead (set RESEND_API_KEY).');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⚠️  Connection timeout. Check your network and SMTP settings.');
      console.error('   💡 Tip: Railway may block SMTP. Use Resend API instead (set RESEND_API_KEY).');
    }
    
    return { sent: false, error: error.message };
  }
};

// Welcome email template
const getWelcomeEmailTemplate = (userName, userEmail) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: '🎉 Welcome to Financial Planner - Best Decision of Your Life!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Welcome to Financial Planner!</h1>
      <p style="margin: 0; font-size: 18px;">You've Made the Best Decision of Your Life!</p>
    </div>
    <div class="content">
      <h2>Hi ${userName || 'there'}! 👋</h2>
      <p>Congratulations on taking control of your financial future! We're thrilled to have you on board.</p>
      
      <p><strong>You've just made one of the best decisions of your life</strong> by choosing Financial Planner. Here's why:</p>
      
      <div class="feature">
        <h3>🎯 Complete Financial Overview</h3>
        <p>Track all your accounts, expenses, income, and investments in one beautiful dashboard.</p>
      </div>
      
      <div class="feature">
        <h3>💳 Multi-Currency Support</h3>
        <p>Manage accounts and transactions in any currency with automatic conversion.</p>
      </div>
      
      <div class="feature">
        <h3>📊 Powerful Analytics</h3>
        <p>Visual charts and insights to understand your spending patterns and financial health.</p>
      </div>
      
      <div class="feature">
        <h3>🔔 Smart Reminders</h3>
        <p>Never miss a bill payment or important financial deadline.</p>
      </div>
      
      <div class="feature">
        <h3>🔒 Bank-Level Security</h3>
        <p>Your data is encrypted and secure. We take your privacy seriously.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${frontendUrl}/dashboard" class="button">Get Started Now →</a>
      </div>
      
      <p>We're here to help you achieve your financial goals. If you have any questions, don't hesitate to reach out!</p>
      
      <p>Welcome aboard! 🎉</p>
      <p><strong>The Financial Planner Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Financial Planner. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Welcome to Financial Planner!

Hi ${userName || 'there'}!

Congratulations on taking control of your financial future! We're thrilled to have you on board.

You've just made one of the best decisions of your life by choosing Financial Planner.

Features:
- Complete Financial Overview
- Multi-Currency Support
- Powerful Analytics
- Smart Reminders
- Bank-Level Security

Get started: ${frontendUrl}/dashboard

Welcome aboard!
The Financial Planner Team
    `
  };
};

// Password reset email template
const getPasswordResetEmailTemplate = (resetLink, expiresAt) => {
  return {
    subject: '🔐 Reset Your Password - Financial Planner',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello!</h2>
      <p>We received a request to reset your password for your Financial Planner account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Reset My Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
      
      <div class="warning">
        <strong>⚠️ Important:</strong>
        <ul>
          <li>This link will expire in 1 hour</li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Your password will not change until you click the link above</li>
        </ul>
      </div>
      
      <p>For security reasons, this link can only be used once.</p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Stay secure! 🔒</p>
      <p><strong>The Financial Planner Team</strong></p>
    </div>
    <div class="footer">
      <p>This link expires at: ${new Date(expiresAt).toLocaleString()}</p>
      <p>© ${new Date().getFullYear()} Financial Planner. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Password Reset Request

Hello!

We received a request to reset your password for your Financial Planner account.

Click this link to reset your password:
${resetLink}

Important:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password will not change until you click the link above

For security reasons, this link can only be used once.

Stay secure!
The Financial Planner Team
    `
  };
};

// Email verification template
const getEmailVerificationTemplate = (verificationLink, userName) => {
  return {
    subject: '✅ Verify Your Financial Planner Email Address',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Verify Your Email</h1>
      <p style="margin: 0;">Welcome to Financial Planner!</p>
    </div>
    <div class="content">
      <h2>Hi ${userName || 'there'}! 👋</h2>
      <p>Thank you for signing up for Financial Planner! We're excited to have you on board.</p>
      
      <div class="info">
        <strong>📧 Email Verification Required</strong>
        <p>To complete your registration and start using Financial Planner, please verify your email address by clicking the button below.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" class="button">Verify My Email Address</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
      
      <div class="warning">
        <strong>⚠️ Important:</strong>
        <ul>
          <li>This link will expire in 24 hours</li>
          <li>You must verify your email before you can log in</li>
          <li>If you didn't create this account, please ignore this email</li>
        </ul>
      </div>
      
      <p>Once verified, you'll have full access to all Financial Planner features including:</p>
      <ul>
        <li>📊 Complete financial dashboard</li>
        <li>💳 Multi-currency support</li>
        <li>🎯 Goal tracking</li>
        <li>🔔 Bill reminders</li>
        <li>And much more!</li>
      </ul>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Welcome aboard! 🎉</p>
      <p><strong>The Financial Planner Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Financial Planner. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Verify Your Email
Welcome to Financial Planner!

Hi ${userName || 'there'}!

Thank you for signing up for Financial Planner! We're excited to have you on board.

Email Verification Required
To complete your registration and start using Financial Planner, please verify your email address by clicking the link below.

Verify My Email: ${verificationLink}

Important:
- This link will expire in 24 hours
- You must verify your email before you can log in
- If you didn't create this account, please ignore this email

Once verified, you'll have full access to all Financial Planner features.

Welcome aboard!
The Financial Planner Team
    `
  };
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const template = getWelcomeEmailTemplate(userName, userEmail);
  return await sendEmail(userEmail, template.subject, template.html, template.text);
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetLink, expiresAt) => {
  const template = getPasswordResetEmailTemplate(resetLink, expiresAt);
  return await sendEmail(userEmail, template.subject, template.html, template.text);
};

// Send email verification
const sendEmailVerification = async (userEmail, verificationLink, userName) => {
  const template = getEmailVerificationTemplate(verificationLink, userName);
  return await sendEmail(userEmail, template.subject, template.html, template.text);
};

module.exports = {
  initEmailService,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendEmail
};
