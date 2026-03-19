'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createUser } from '@/lib/db-operations'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'Display name is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type RegisterState = {
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    displayName?: string[]
  }
  success?: boolean
}

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    displayName: formData.get('displayName')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const { email, password, displayName } = validatedFields.data

  try {
    await createUser(email, password, displayName)
    redirect('/login?registered=true')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Registration error:', error)
    return {
      error: error instanceof Error ? error.message : 'An error occurred during registration. Please try again.'
    }
  }
}
