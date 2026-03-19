'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueProfileSlug } from '@/lib/slug-utils'

const makerSetupSchema = z.object({
  userId: z.string(),
  shopName: z.string().min(1, 'Shop name is required').max(100),
  shopBanner: z.string().url('Invalid URL').optional().or(z.literal('')),
  categories: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select at least one category'
        })
        return z.NEVER
      }
      return parsed as string[]
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid categories format'
      })
      return z.NEVER
    }
  })
})

export type MakerSetupState = {
  error?: string
  errors?: {
    shopName?: string[]
    shopBanner?: string[]
    categories?: string[]
  }
  success?: boolean
}

export async function upgradeToMakerAction(
  prevState: MakerSetupState,
  formData: FormData
): Promise<MakerSetupState> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized. Please log in.'
    }
  }

  const validatedFields = makerSetupSchema.safeParse({
    userId: formData.get('userId'),
    shopName: formData.get('shopName'),
    shopBanner: formData.get('shopBanner'),
    categories: formData.get('categories')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const data = validatedFields.data

  // Verify the userId matches the session user
  if (data.userId !== session.user.id) {
    return {
      error: 'Unauthorized action.'
    }
  }

  try {
    // Check if user is already a maker
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      return {
        error: 'User not found.'
      }
    }

    if (user.role === 'maker' || user.role === 'admin') {
      return {
        error: 'You are already a maker.'
      }
    }

    // Generate unique profile slug from shop name
    const profileSlug = await generateUniqueProfileSlug(data.shopName, data.userId)

    // Update user role and profile in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: data.userId },
        data: { role: 'maker' }
      }),
      prisma.profile.update({
        where: { userId: data.userId },
        data: {
          shopName: data.shopName,
          shopBanner: data.shopBanner || null,
          categories: data.categories,
          profileSlug: profileSlug || null
        }
      })
    ])

    redirect('/profile')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Error upgrading to maker:', error)
    return {
      error: 'Failed to upgrade to maker. Please try again.'
    }
  }
}
