import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProfileEditForm } from './ProfileEditForm'

export default async function ProfileEditPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch the user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    // This shouldn't happen, but handle it gracefully
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p>Unable to load your profile. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <ProfileEditForm profile={profile} />
    </div>
  )
}
