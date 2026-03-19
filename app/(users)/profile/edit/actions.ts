'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueProfileSlug } from '@/lib/slug-utils'

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  socialLinks: z.object({
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    youtube: z.string().optional().or(z.literal(''))
  }).optional()
})

export type ProfileEditState = {
  error?: string
  errors?: {
    displayName?: string[]
    photoUrl?: string[]
    bio?: string[]
    location?: string[]
    socialLinks?: string[]
  }
  success?: boolean
}

export async function updateProfileAction(
  prevState: ProfileEditState,
  formData: FormData
): Promise<ProfileEditState> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized. Please log in.'
    }
  }

  const validatedFields = profileSchema.safeParse({
    displayName: formData.get('displayName'),
    photoUrl: formData.get('photoUrl'),
    bio: formData.get('bio'),
    location: formData.get('location'),
    socialLinks: {
      website: formData.get('website'),
      instagram: formData.get('instagram'),
      youtube: formData.get('youtube')
    }
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.'
    }
  }

  const data = validatedFields.data

  try {
    // Get current profile to check if display name changed
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true, profileSlug: true }
    })

    // Clean up empty strings and prepare data
    const updateData: any = {
      displayName: data.displayName,
      photoUrl: data.photoUrl || null,
      bio: data.bio || null,
      location: data.location || null
    }

    // If display name changed and user is a maker, regenerate slug
    if (currentProfile && data.displayName !== currentProfile.displayName) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })
      
      if (user?.role === 'maker') {
        const newSlug = await generateUniqueProfileSlug(data.displayName, session.user.id)
        updateData.profileSlug = newSlug || null
      }
    }

    // Handle social links
    if (data.socialLinks) {
      const cleanedLinks: any = {}
      if (data.socialLinks.website) cleanedLinks.website = data.socialLinks.website
      if (data.socialLinks.instagram) cleanedLinks.instagram = data.socialLinks.instagram
      if (data.socialLinks.youtube) cleanedLinks.youtube = data.socialLinks.youtube
      
      updateData.socialLinks = Object.keys(cleanedLinks).length > 0 ? cleanedLinks : null
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData
    })

    redirect('/profile')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Error updating profile:', error)
    return {
      error: 'Failed to update profile. Please try again.'
    }
  }
}
