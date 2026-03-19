'use server'

import { signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export type LoginState = {
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
  success?: boolean
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const { email, password } = validatedFields.data

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (!result) {
      return {
        error: 'Invalid credentials'
      }
    }

    redirect('/')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return {
      error: 'Invalid credentials'
    }
  }
}
