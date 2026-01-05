const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const validator = require('validator');
const db = require('../database');
const { generateToken, authenticate } = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } = require('../utils/emailService');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, country, default_currency, mobile_number } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!country) {
      return res.status(400).json({ error: 'Country is required' });
    }

    if (!default_currency) {
      return res.status(400).json({ error: 'Default currency is required' });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists (application level check) - do this FIRST before any other operations
    let existingUsers;
    try {
      existingUsers = await db.query('SELECT id, email_verified FROM users WHERE email = ?', [normalizedEmail]);
    } catch (checkError) {
      console.error('❌ Error checking for existing user:', checkError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Unable to check if email is already registered. Please try again.'
      });
    }
    
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const isVerified = existingUser.email_verified === 1 || existingUser.email_verified === true;
      
      if (isVerified) {
        return res.status(400).json({ 
          error: 'Email already registered',
          message: 'This email address is already registered and verified. Please log in instead.',
          alreadyRegistered: true
        });
      } else {
        // User exists but email not verified - allow resending verification
        return res.status(400).json({ 
          error: 'Email already registered',
          message: 'This email address is already registered but not verified. Please check your email or use "Resend Verification" on the login page.',
          alreadyRegistered: true,
          requiresVerification: true,
          email: normalizedEmail
        });
      }
    }

    // Hash password
    const saltRounds = 10;
    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (hashError) {
      console.error('❌ Error hashing password:', hashError);
      return res.status(500).json({ 
        error: 'Password encryption error',
        message: 'Unable to process password. Please try again.'
      });
    }

    // Create user (default to free tier, email NOT verified yet)
    // Database has UNIQUE constraint on email, so this will fail if email exists
    let result;
    try {
      console.log(`📝 Attempting to create user: ${normalizedEmail}`);
      result = await db.run(
        'INSERT INTO users (email, password_hash, name, mobile_number, country, default_currency, subscription_tier, subscription_status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [normalizedEmail, passwordHash, name || null, mobile_number || null, country, default_currency || 'USD', 'free', 'active', 0]
      );
      console.log(`✅ User created successfully with ID: ${result.id}`);
      
      // Verify user was actually saved
      const verifyUser = await db.query('SELECT id, email FROM users WHERE id = ?', [result.id]);
      if (!verifyUser || verifyUser.length === 0) {
        console.error('❌ CRITICAL: User was not saved to database!');
        return res.status(500).json({ 
          error: 'Failed to save user account',
          message: 'User registration failed. Please try again.'
        });
      }
      console.log(`✓ Verified user exists in database: ${verifyUser[0].email} (ID: ${verifyUser[0].id})`);
    } catch (dbError) {
      console.error('❌ Database error during registration:', dbError);
      console.error('   Error code:', dbError.code);
      console.error('   Error message:', dbError.message);
      
      // Handle database constraint violation (email already exists)
      if (dbError.code === 'SQLITE_CONSTRAINT' || 
          dbError.code === '23505' || // PostgreSQL unique violation
          dbError.message?.includes('UNIQUE constraint') || 
          dbError.message?.includes('UNIQUE') ||
          dbError.message?.includes('duplicate key')) {
        console.log(`⚠️  Email already exists (caught by DB constraint): ${normalizedEmail}`);
        
        // Check if user exists and is verified
        const checkUser = await db.query('SELECT id, email_verified FROM users WHERE email = ?', [normalizedEmail]);
        if (checkUser && checkUser.length > 0) {
          const isVerified = checkUser[0].email_verified === 1 || checkUser[0].email_verified === true;
          return res.status(400).json({ 
            error: 'Email already registered',
            message: isVerified 
              ? 'This email address is already registered and verified. Please log in instead.'
              : 'This email address is already registered but not verified. Please check your email or use "Resend Verification" on the login page.',
            alreadyRegistered: true,
            requiresVerification: !isVerified
          });
        }
        
        return res.status(400).json({ 
          error: 'Email already registered',
          message: 'This email address is already in use. Please use a different email or try logging in instead.',
          alreadyRegistered: true
        });
      }
      
      // Re-throw if it's a different error
      throw dbError;
    }

    // Generate token
    const token = generateToken(result.id);
    
    // Fetch the complete user record to ensure all fields are correct
    const newUser = await db.query(
      'SELECT id, email, name, country, default_currency, subscription_tier, subscription_status FROM users WHERE id = ?',
      [result.id]
    );

    if (!newUser || newUser.length === 0) {
      console.error(`❌ CRITICAL: User ${result.id} not found after creation!`);
      return res.status(500).json({ 
        error: 'Failed to retrieve user account',
        message: 'User was created but could not be retrieved. Please try logging in.'
      });
    }

    const userData = newUser[0];
    console.log(`✅ New user registered: ${normalizedEmail} (ID: ${result.id})`);
    console.log(`   User data:`, JSON.stringify(userData, null, 2));

    // Generate email verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Store verification token in database
    try {
      await db.run(
        'INSERT INTO email_verifications (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
        [result.id, normalizedEmail, verificationToken, expiresAt.toISOString()]
      );
      
      // Send verification email (await to check if it was sent)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
      console.log(`📧 Generating verification link:`);
      console.log(`   FRONTEND_URL env var: ${process.env.FRONTEND_URL || 'NOT SET (using localhost fallback)'}`);
      console.log(`   Using frontend URL: ${frontendUrl}`);
      console.log(`   Verification link: ${verificationLink}`);
      console.log(`   Recipient: ${normalizedEmail}`);
      
      // Try to send verification email, but don't fail registration if it fails
      let emailResult = { sent: false, error: 'Unknown error' };
      try {
        console.log(`📧 Attempting to send verification email to ${normalizedEmail}...`);
        emailResult = await sendEmailVerification(normalizedEmail, verificationLink, name || normalizedEmail.split('@')[0]);
        
        if (!emailResult.sent) {
          console.error(`❌ Verification email FAILED to send to ${normalizedEmail}`);
          console.error(`   Error: ${emailResult.error}`);
          console.error(`   This may be due to:`);
          console.error(`   - Email service not configured (check SMTP_USER/SMTP_PASS or RESEND_API_KEY)`);
          console.error(`   - Email service connection issues`);
          console.error(`   - Email provider blocking the email`);
          console.error(`   User can use "Resend Verification" on login page`);
        } else {
          console.log(`✅ Verification email sent successfully to ${normalizedEmail}`);
          if (emailResult.messageId) {
            console.log(`   Message ID: ${emailResult.messageId}`);
          }
        }
      } catch (emailError) {
        console.error(`❌ EXCEPTION while sending verification email to ${normalizedEmail}:`, emailError);
        console.error(`   Error message: ${emailError.message}`);
        console.error(`   Error stack:`, emailError.stack);
        emailResult = { sent: false, error: emailError.message || 'Exception sending email' };
      }
      
      // Also send welcome email (asynchronously, don't wait)
      try {
        sendWelcomeEmail(normalizedEmail, name || normalizedEmail.split('@')[0])
          .then(result => {
            if (result.sent) {
              console.log(`✅ Welcome email sent to ${normalizedEmail}`);
            } else {
              console.warn(`⚠️  Welcome email not sent to ${normalizedEmail}: ${result.error || 'Email service not configured'}`);
            }
          })
          .catch(err => {
            console.error(`❌ Error sending welcome email to ${normalizedEmail}:`, err);
          });
      } catch (welcomeError) {
        console.error(`❌ Exception while sending welcome email to ${normalizedEmail}:`, welcomeError);
      }
      
      // Always return success, even if emails failed
      if (!emailResult.sent) {
        // In development, return the link in the response
        if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
          return res.status(201).json({
            message: 'User registered successfully. Email verification failed - use the link below.',
            token: null,
            user: { ...userData, email_verified: 0 },
            requiresVerification: true,
            verificationLink: verificationLink,
            emailError: emailResult.error,
            warning: 'Email service not configured. Please configure SMTP settings in .env file.'
          });
        }
        
        // In production, still return success but log the error
        return res.status(201).json({
          message: 'User registered successfully. However, we could not send the verification email. Please use "Resend Verification" on the login page.',
          token: null,
          user: { ...userData, email_verified: 0 },
          requiresVerification: true,
          emailError: true
        });
      }
      
      // In development mode, include verification link in response
      if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
        return res.status(201).json({
          message: 'User registered successfully. Please check your email to verify your account.',
          token: null, // Don't give token until verified
          user: { ...userData, email_verified: 0 },
          requiresVerification: true,
          verificationLink: verificationLink // Only in development
        });
      }
    } catch (verificationError) {
      console.error('Error creating verification token:', verificationError);
      // Continue with registration even if verification token creation fails
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account before logging in.',
      token: null, // Don't give token until verified
      user: { ...userData, email_verified: 0 },
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    // Log full error details
    console.error('=== REGISTRATION ERROR DETAILS ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    if (error.errno) console.error('Error number:', error.errno);
    if (error.sql) console.error('SQL:', error.sql);
    console.error('==================================');
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get user from database
    const users = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    const emailVerified = user.email_verified === 1 || user.email_verified === true;
    if (!emailVerified) {
      // Generate new verification token if needed
      const crypto = require('crypto');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Delete old verification tokens
      await db.run('DELETE FROM email_verifications WHERE user_id = ? AND used = 0', [user.id]);
      
      // Create new verification token
      await db.run(
        'INSERT INTO email_verifications (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
        [user.id, user.email, verificationToken, expiresAt.toISOString()]
      );
      
      // Send verification email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
      const emailResult = await sendEmailVerification(user.email, verificationLink, user.name || user.email.split('@')[0]);
      
      if (!emailResult.sent) {
        console.error(`❌ Failed to resend verification email to ${user.email}`);
        console.error(`   Error: ${emailResult.error}`);
        return res.status(500).json({
          error: 'Failed to send verification email',
          message: `We could not send the verification email. Error: ${emailResult.error}. Please check your email service configuration or try again later.`,
          emailError: emailResult.error
        });
      }
      
      console.log(`✅ Verification email resent to ${user.email}`);
      if (emailResult.messageId) {
        console.log(`   Message ID: ${emailResult.messageId}`);
      }
      
      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. A new verification email has been sent to your inbox.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user.id);
    
    console.log(`✅ User logged in: ${user.email} (ID: ${user.id})`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        default_currency: user.default_currency || 'USD',
        subscription_tier: user.subscription_tier || 'free',
        subscription_status: user.subscription_status || 'active',
        email_verified: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    // Log full error details
    console.error('=== LOGIN ERROR DETAILS ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    if (error.errno) console.error('Error number:', error.errno);
    if (error.sql) console.error('SQL:', error.sql);
    console.error('===========================');
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get current user (requires auth, but endpoint is public)
router.get('/me', async (req, res) => {
  try {
    // This will be protected by authenticate middleware when used
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const { verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const users = await db.query(
      'SELECT id, email, name, country, default_currency, subscription_tier, subscription_status, subscription_expires_at, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Email - Verify email with token
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    console.log(`🔍 Verifying email token: ${token.substring(0, 10)}...`);

    // Find the verification token
    const verificationTokens = await db.query(
      'SELECT * FROM email_verifications WHERE token = ? AND used = 0',
      [token]
    );

    console.log(`   Found ${verificationTokens ? verificationTokens.length : 0} token(s)`);

    if (!verificationTokens || verificationTokens.length === 0) {
      // Check if token exists but is already used
      const usedTokens = await db.query(
        'SELECT * FROM email_verifications WHERE token = ?',
        [token]
      );
      
      if (usedTokens && usedTokens.length > 0) {
        console.log(`   Token found but already used`);
        return res.status(400).json({ 
          error: 'This verification link has already been used. Please request a new verification email.' 
        });
      }
      
      console.log(`   Token not found in database`);
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    const verificationToken = verificationTokens[0];

    // Check if token is expired
    const expiresAt = new Date(verificationToken.expires_at);
    if (expiresAt < new Date()) {
      // Mark as used and delete expired token
      await db.run('UPDATE email_verifications SET used = 1 WHERE id = ?', [verificationToken.id]);
      return res.status(400).json({ 
        error: 'Verification token has expired. Please request a new verification email.' 
      });
    }

    // Verify the user's email
    await db.run(
      'UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [verificationToken.user_id]
    );

    // Mark token as used
    await db.run('UPDATE email_verifications SET used = 1 WHERE id = ?', [verificationToken.id]);

    // Clean up old used tokens (older than 24 hours)
    await db.run(
      'DELETE FROM email_verifications WHERE used = 1 AND created_at < datetime("now", "-1 day")'
    );

    console.log(`✅ Email verified for user ID: ${verificationToken.user_id}`);

    res.json({
      message: 'Email verified successfully! You can now log in to your account.',
      success: true
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred while verifying your email'
    });
  }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const users = await db.query('SELECT id, email, name, email_verified FROM users WHERE email = ?', [email.toLowerCase()]);
    
    if (!users || users.length === 0) {
      // Don't reveal if email exists (security best practice)
      return res.json({
        message: 'If an account exists with that email, a verification email has been sent.',
        success: true
      });
    }

    const user = users[0];

    // Check if already verified
    if (user.email_verified === 1 || user.email_verified === true) {
      return res.json({
        message: 'Email is already verified. You can log in now.',
        success: true,
        alreadyVerified: true
      });
    }

    // Generate new verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Delete old verification tokens
    await db.run('DELETE FROM email_verifications WHERE user_id = ? AND used = 0', [user.id]);
    
    // Create new verification token
    await db.run(
      'INSERT INTO email_verifications (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, user.email, verificationToken, expiresAt.toISOString()]
    );
    
    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const emailResult = await sendEmailVerification(user.email, verificationLink, user.name || user.email.split('@')[0]);
    
    if (emailResult.sent) {
      console.log(`✅ Verification email resent to ${user.email}`);
      return res.json({
        message: 'Verification email has been sent. Please check your inbox.',
        success: true
      });
    } else {
      console.warn(`⚠️  Verification email not sent: ${emailResult.error || 'Email service not configured'}`);
      return res.json({
        message: 'We could not send the verification email. Please try again later or contact support.',
        success: false,
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred while sending the verification email'
    });
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const users = await db.query('SELECT id, email FROM users WHERE email = ?', [email.toLowerCase()]);
    
    // Always return success message (security best practice - don't reveal if email exists)
    if (users && users.length > 0) {
      const user = users[0];
      
      // Generate secure reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Delete any existing reset tokens for this user
      await db.run('DELETE FROM password_resets WHERE user_id = ? AND used = 0', [user.id]);
      
      // Store reset token in database
      await db.run(
        'INSERT INTO password_resets (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
        [user.id, email.toLowerCase(), resetToken, expiresAt.toISOString()]
      );
      
      // In production, send email with reset link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      console.log(`\n🔐 Password Reset Request:`);
      console.log(`   Email: ${email.toLowerCase()}`);
      console.log(`   Token: ${resetToken}`);
      console.log(`   Reset Link: ${resetLink}`);
      console.log(`   Expires: ${expiresAt.toISOString()}\n`);
      
      // Send password reset email (don't wait for it to complete - send response immediately)
      console.log(`📧 Starting to send password reset email to: ${email.toLowerCase()}`);
      sendPasswordResetEmail(email.toLowerCase(), resetLink, expiresAt)
        .then(emailResult => {
          if (emailResult.sent) {
            console.log(`✅ Password reset email sent successfully to ${email.toLowerCase()}`);
            console.log(`   Message ID: ${emailResult.messageId || 'N/A'}`);
          } else {
            console.error(`❌ Password reset email FAILED to send to ${email.toLowerCase()}`);
            console.error(`   Error: ${emailResult.error || 'Email service not configured'}`);
            console.error(`   This is a critical issue - user will not receive reset link!`);
          }
        })
        .catch(err => {
          console.error(`❌ CRITICAL ERROR sending password reset email to ${email.toLowerCase()}:`, err);
          console.error(`   Error message: ${err.message}`);
          console.error(`   Error stack: ${err.stack}`);
        });
      
      // In development mode, also return the reset link in the response if email might fail
      if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
        return res.json({
          message: 'Password reset link generated successfully. Check your email or use the link below if email service is not configured.',
          success: true,
          resetLink: resetLink, // Only in development
          token: resetToken, // Only in development
          expiresAt: expiresAt.toISOString(),
          emailSent: true // Assume sent, will be logged separately
        });
      }
    }

    // Always return success message immediately (security best practice - don't reveal if email exists)
    // Don't wait for email to send - return response right away
    res.json({
      message: 'If an account exists with that email, a password reset link has been sent. Please check your email inbox.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred while processing your request'
    });
  }
});

// Reset Password - Update password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find the reset token
    const resetTokens = await db.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0',
      [token]
    );

    if (!resetTokens || resetTokens.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset link.' 
      });
    }

    const resetToken = resetTokens[0];

    // Check if token is expired
    const expiresAt = new Date(resetToken.expires_at);
    if (expiresAt < new Date()) {
      // Mark as used and delete expired token
      await db.run('UPDATE password_resets SET used = 1 WHERE id = ?', [resetToken.id]);
      return res.status(400).json({ 
        error: 'Reset token has expired. Please request a new password reset link.' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password
    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await db.run('UPDATE password_resets SET used = 1 WHERE id = ?', [resetToken.id]);

    // Clean up old used tokens (older than 24 hours)
    await db.run(
      'DELETE FROM password_resets WHERE used = 1 AND created_at < datetime("now", "-1 day")'
    );

    res.json({
      message: 'Password has been reset successfully. You can now login with your new password.',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred while resetting your password'
    });
  }
});

// Google Sign-In (lazy loaded - won't break server if not configured)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured on server' });
    }

    // Lazy load Google OAuth client (only when this route is called)
    let OAuth2Client, client;
    try {
      const googleAuth = require('google-auth-library');
      OAuth2Client = googleAuth.OAuth2Client;
      client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    } catch (error) {
      console.error('Error loading google-auth-library:', error);
      return res.status(500).json({ error: 'Google OAuth library not available' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    
    let user;
    let isNewUser = false;

    if (existingUsers && existingUsers.length > 0) {
      // User exists - log them in
      user = existingUsers[0];
      
      // Update user info if needed (name, picture, etc.)
      if (name && name !== user.name) {
        await db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, user.id]);
        user.name = name;
      }
    } else {
      // New user - create account
      isNewUser = true;
      
      // Generate a random password (won't be used, but required by schema)
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const result = await db.run(
        'INSERT INTO users (email, password_hash, name, email_verified, email_verified_at, subscription_tier, subscription_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [normalizedEmail, passwordHash, name || 'User', 1, new Date().toISOString(), 'free', 'active']
      );

      user = {
        id: result.id,
        email: normalizedEmail,
        name: name || 'User',
        email_verified: 1,
        subscription_tier: 'free',
        subscription_status: 'active'
      };

      // Send welcome email (don't wait for it)
      sendWelcomeEmail(normalizedEmail, name || 'User')
        .then(result => {
          if (result.sent) {
            console.log(`✅ Welcome email sent to ${normalizedEmail}`);
          } else {
            console.log(`⚠️  Welcome email not sent to ${normalizedEmail}: ${result.error}`);
          }
        })
        .catch(err => {
          console.error(`❌ Error sending welcome email to ${normalizedEmail}:`, err);
        });
    }

    // Check if user needs to complete profile (missing country or currency)
    const needsProfileCompletion = !user.country || !user.default_currency;

    // Generate JWT token (only pass user ID, not the whole object)
    const token = generateToken(user.id);

    res.json({
      message: isNewUser ? 'Account created successfully with Google' : 'Signed in successfully with Google',
      token,
      needsProfileCompletion,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country || null,
        default_currency: user.default_currency || null,
        subscription_tier: user.subscription_tier || 'free',
        subscription_status: user.subscription_status || 'active',
        email_verified: user.email_verified || 1
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred during Google sign-in'
    });
  }
});

// Complete Profile - Update country and currency
// This route needs authentication, so it should be in protected routes
// But we'll handle auth check here since it's in auth.js
router.post('/complete-profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { country, default_currency } = req.body;

    if (!country || !default_currency) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Country and default currency are required' 
      });
    }

    // Update user profile
    await db.run(
      'UPDATE users SET country = ?, default_currency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [country, default_currency, userId]
    );

    // Get updated user
    const users = await db.query(
      'SELECT id, email, name, country, default_currency, subscription_tier, subscription_status FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An error occurred while updating profile'
    });
  }
});

module.exports = router;

