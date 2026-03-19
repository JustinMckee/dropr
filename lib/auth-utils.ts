import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Get the current authenticated user with profile
 */
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true
    }
  })
  
  return user
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: 'member' | 'maker' | 'admin') {
  const session = await auth()
  return session?.user?.role === role
}

/**
 * Check if user is an admin
 */
export async function isAdmin() {
  const session = await auth()
  return session?.user?.role === 'admin'
}

/**
 * Check if user is an arbitrator
 */
export async function isArbitrator() {
  const session = await auth()
  return session?.user?.isArbitrator === true
}

/**
 * Check if user is a maker
 */
export async function isMaker() {
  const session = await auth()
  return session?.user?.role === 'maker'
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  
  return session.user
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: 'member' | 'maker' | 'admin') {
  const user = await requireAuth()
  
  if (user.role !== role) {
    throw new Error('Forbidden')
  }
  
  return user
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole('admin')
}

/**
 * Require maker role
 */
export async function requireMaker() {
  return requireRole('maker')
}
