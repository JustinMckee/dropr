import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { MakerSetupForm } from './MakerSetupForm'

export default async function MakerSetupPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>Unable to load your account. Please contact support.</p>
      </div>
    )
  }

  // If already a maker, redirect to profile
  if (user.role === 'maker' || user.role === 'admin') {
    redirect('/profile')
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Become a Maker</h1>
        <p className="text-muted-foreground">
          Set up your maker profile to start selling your creations on Dropr
        </p>
      </div>
      <MakerSetupForm userId={user.id} profile={user.profile} />
    </div>
  )
}
