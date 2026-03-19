'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export type ForgotPasswordState = {
  error?: string
  errors?: { email?: string[] }
  success?: boolean
  message?: string
}

export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const { email } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with that email, you will receive a password reset link.'
      }
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // Send reset email
    await sendPasswordResetEmail(email, token)

    return {
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.'
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      error: 'Failed to process request. Please try again.'
    }
  }
}
