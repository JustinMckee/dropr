import { prisma } from '@/lib/prisma'

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique profile slug for a maker
 * Tries the base slug first, then appends numbers if taken
 */
export async function generateUniqueProfileSlug(
  baseText: string,
  userId?: string
): Promise<string> {
  const baseSlug = generateSlug(baseText)
  
  if (!baseSlug) {
    // If slug generation fails, return empty string to use ID as fallback
    return ''
  }

  // Check if base slug is available
  const existing = await prisma.profile.findUnique({
    where: { profileSlug: baseSlug },
    select: { userId: true }
  })

  // If not taken, or taken by the same user (updating their own profile), use it
  if (!existing || existing.userId === userId) {
    return baseSlug
  }

  // Try appending numbers until we find an available slug
  let counter = 1
  while (counter < 100) {
    const candidateSlug = `${baseSlug}-${counter}`
    const existingCandidate = await prisma.profile.findUnique({
      where: { profileSlug: candidateSlug },
      select: { userId: true }
    })

    if (!existingCandidate || existingCandidate.userId === userId) {
      return candidateSlug
    }

    counter++
  }

  // If we can't find a unique slug after 100 attempts, return empty string
  // This will cause the system to fall back to using the user ID
  return ''
}
