import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  
  try {
    await resend.emails.send({
      from: 'Dropr <onboarding@resend.dev>', // Update with your verified domain
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Welcome to Dropr!</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px;">Thanks for signing up. Please verify your email address to get started.</p>
              <a href="${verificationUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">This link will expire in 24 hours.</p>
          </body>
        </html>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  try {
    await resend.emails.send({
      from: 'Dropr <onboarding@resend.dev>', // Update with your verified domain
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Reset your password</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px;">We received a request to reset your password. Click the button below to create a new password.</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">This link will expire in 1 hour.</p>
          </body>
        </html>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
