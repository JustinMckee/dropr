'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type ResetPasswordState = {
  error?: string
  errors?: {
    token?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  success?: boolean
}

export async function resetPasswordAction(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const { token, password } = validatedFields.data

  try {
    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return {
        error: 'Invalid or expired reset link'
      }
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      })
      return {
        error: 'Reset link has expired. Please request a new one.'
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash }
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      error: 'Failed to reset password. Please try again.'
    }
  }
}
