-- Update email confirmation template to be more professional
-- This is a reference for the email content structure
-- Actual email templates are configured in Supabase dashboard under Authentication > Email Templates

/*
Professional Email Confirmation Template:

Subject: Welcome to VertexAI - Confirm Your Email

Body:
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; }
    .button { display: inline-block; background: #000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">Welcome to VertexAI</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Transform your ideas into animated videos</p>
    </div>
    <div class="content">
      <h2 style="color: #000; margin-top: 0;">Confirm Your Email Address</h2>
      <p>Thank you for joining VertexAI! We're excited to have you on board.</p>
      <p>To get started with creating amazing animated videos from text, please confirm your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't create an account with VertexAI, you can safely ignore this email.</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
    </div>
    <div class="footer">
      <p>© 2025 VertexAI. All rights reserved.</p>
      <p>Need help? Contact us at support@vertexai.com</p>
    </div>
  </div>
</body>
</html>

Note: To apply this template, go to your Supabase Dashboard:
1. Navigate to Authentication > Email Templates
2. Select "Confirm signup" template
3. Replace the content with the HTML above
4. Save changes
*/
