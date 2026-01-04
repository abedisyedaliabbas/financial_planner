# Email Service Setup

## Overview

Financial Planner uses Nodemailer to send welcome emails and password reset emails. The email service is automatically initialized when the server starts.

## Configuration

Add the following environment variables to your `server/.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Email Providers

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail" and "Other (Custom name)"
   - Use this password as `SMTP_PASS`

3. **Configuration**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Outlook/Hotmail Setup

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid Setup

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES Setup

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASS=your-aws-ses-smtp-password
```

## Development Mode

If email service is not configured (no SMTP credentials), the system will:

1. **Welcome Emails**: Still attempt to send, but log a warning if it fails
2. **Password Reset**: Return the reset link directly in the API response (for testing)

This allows development without email configuration.

## Testing

To test email functionality:

1. Configure SMTP settings in `server/.env`
2. Restart the server
3. Register a new user - you should receive a welcome email
4. Request a password reset - you should receive a reset email

## Troubleshooting

### Emails Not Sending

1. **Check Server Logs**: Look for email service initialization messages
2. **Verify Credentials**: Ensure SMTP_USER and SMTP_PASS are correct
3. **Check Firewall**: Ensure port 587 or 465 is not blocked
4. **Test Connection**: The server will verify the email connection on startup

### Gmail Specific Issues

- Make sure you're using an **App Password**, not your regular password
- Ensure 2-Factor Authentication is enabled
- Check that "Less secure app access" is not required (App Passwords replace this)

### Common Error Messages

- `Invalid login`: Check your SMTP credentials
- `Connection timeout`: Check firewall/network settings
- `Email service not configured`: Add SMTP settings to `.env` file

## Production Recommendations

For production deployments:

1. **Use a dedicated email service**: SendGrid, AWS SES, or Mailgun
2. **Set up SPF/DKIM records**: For better email deliverability
3. **Monitor email delivery**: Set up alerts for failed emails
4. **Rate limiting**: Email service already has rate limiting built-in
5. **Backup email service**: Consider having a fallback email provider

## Email Templates

Email templates are located in `server/utils/emailService.js`:

- **Welcome Email**: Sent when a user registers
- **Password Reset Email**: Sent when a user requests password reset

You can customize these templates by editing the HTML and text content in the email service file.


