import 'server-only'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from './email'
import crypto from 'crypto'
import { generateUniqueProfileSlug } from './slug-utils'

export async function createUser(email: string, password: string, displayName: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Generate profile slug from display name
  const profileSlug = await generateUniqueProfileSlug(displayName)

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
          displayName,
          profileSlug: profileSlug || null
        }
      }
    }
  })

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store verification token in database
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires
    }
  })

  // Send verification email
  await sendVerificationEmail(user.email, token)

  return user
}
