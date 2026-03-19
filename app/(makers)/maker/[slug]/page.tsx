import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params

  // Try to find by profileSlug first, then fall back to ID
  let user = await prisma.user.findFirst({
    where: {
      profile: {
        profileSlug: slug
      }
    },
    include: { profile: true }
  })

  // Fallback to ID if not found by slug
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: slug },
      include: { profile: true }
    })
  }

  if (!user || !user.profile) {
    notFound()
  }

  // Only makers have public profiles
  if (user.role !== 'maker') {
    notFound()
  }

  const profile = user.profile
  const socialLinks = profile.socialLinks as { website?: string; instagram?: string; youtube?: string } | null
  const initials = profile.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Maker Shop Banner */}
      {profile.shopBanner && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={profile.shopBanner}
            alt={`${profile.shopName} banner`}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.photoUrl || undefined} alt={profile.displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {profile.shopName || profile.displayName}
              </CardTitle>
              {profile.shopName && (
                <p className="text-lg text-muted-foreground mb-2">{profile.displayName}</p>
              )}
              {profile.location && (
                <p className="text-muted-foreground">{profile.location}</p>
              )}
              <div className="mt-2">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Maker
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {socialLinks && Object.keys(socialLinks).length > 0 && (
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
                    <a
                      href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {socialLinks.instagram}
                    </a>
                  </div>
                )}
                {socialLinks.youtube && (
                  <div>
                    <span className="text-sm font-medium">YouTube: </span>
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {socialLinks.youtube}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maker Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories */}
        {profile.categories && profile.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shop Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.reputationScore !== null && profile.reputationScore !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reputation Score</span>
                <span className="font-semibold">{profile.reputationScore.toFixed(1)}/5.0</span>
              </div>
            )}
            {profile.totalSales !== null && profile.totalSales !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-semibold">{profile.totalSales}</span>
              </div>
            )}
            {profile.avgResponseTime !== null && profile.avgResponseTime !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Response Time</span>
                <span className="font-semibold">{profile.avgResponseTime}h</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Since */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })}
      </div>
    </div>
  )
}
