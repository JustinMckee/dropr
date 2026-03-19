'use server'

import { signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'Display name is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
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

export type LoginState = {
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
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
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        error: 'User with this email already exists'
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'member',
        isArbitrator: false,
        emailVerified: false,
        profile: {
          create: {
            displayName
          }
        }
      }
    })

    // Send verification email
    await sendVerificationEmail(user.email, user.id)

    redirect('/login?registered=true')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Registration error:', error)
    return {
      error: 'An error occurred during registration. Please try again.'
    }
  }
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
