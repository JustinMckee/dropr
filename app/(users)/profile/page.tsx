import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user || !user.profile) {
    return (
      <div className="container max-w-2xl py-8">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p>Unable to load your profile. Please contact support.</p>
      </div>
    )
  }

  const profile = user.profile
  const socialLinks = profile.socialLinks as { website?: string; instagram?: string; youtube?: string } | null
  
  // Generate public profile URL for makers
  const publicProfileUrl = user.role === 'maker' 
    ? `/maker/${profile.profileSlug || session.user.id}`
    : null

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          {publicProfileUrl && (
            <Button asChild variant="outline">
              <Link href={publicProfileUrl}>View Public Profile</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
          {user.role === 'member' && (
            <Button asChild variant="outline">
              <Link href="/profile/maker-setup">Become a Maker</Link>
            </Button>
          )}
        </div>
      </div>

      {user.role === 'maker' && profile.shopName && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Maker Shop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Shop Name: </span>
              <span>{profile.shopName}</span>
            </div>
            {profile.categories && profile.categories.length > 0 && (
              <div>
                <span className="font-semibold">Categories: </span>
                <span>{profile.categories.join(', ')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.photoUrl || undefined} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
              {profile.location && (
                <p className="text-muted-foreground">{profile.location}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {socialLinks && (Object.keys(socialLinks).length > 0) && (
            <div>
              <h3 className="font-semibold mb-2">Social Links</h3>
              <div className="space-y-2">
                {socialLinks.website && (
                  <div>
                    <span className="text-sm font-medium">Website: </span>
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {socialLinks.website}
                    </a>
                  </div>
                )}
                {socialLinks.instagram && (
                  <div>
                    <span className="text-sm font-medium">Instagram: </span>
                    <span className="text-sm text-muted-foreground">{socialLinks.instagram}</span>
                  </div>
                )}
                {socialLinks.youtube && (
                  <div>
                    <span className="text-sm font-medium">YouTube: </span>
                    <span className="text-sm text-muted-foreground">{socialLinks.youtube}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
