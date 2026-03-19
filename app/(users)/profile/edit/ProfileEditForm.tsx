'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfileAction, type ProfileEditState } from './actions'

interface Profile {
  id: string
  userId: string
  displayName: string
  photoUrl: string | null
  bio: string | null
  location: string | null
  socialLinks: any
}

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ProfileEditState, FormData>(
    updateProfileAction,
    {}
  )

  const [bioLength, setBioLength] = useState((profile.bio || '').length)

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your profile information. This will be visible to other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile.displayName}
              required
              maxLength={100}
              placeholder="Your display name"
            />
            {state.errors?.displayName && (
              <p className="text-sm text-destructive">{state.errors.displayName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Profile Photo URL</Label>
            <Input
              id="photoUrl"
              name="photoUrl"
              type="url"
              defaultValue={profile.photoUrl || ''}
              placeholder="https://example.com/photo.jpg"
            />
            {state.errors?.photoUrl && (
              <p className="text-sm text-destructive">{state.errors.photoUrl[0]}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter a URL to your profile photo. Photo upload coming soon!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio || ''}
              onChange={(e) => setBioLength(e.target.value.length)}
              maxLength={500}
              rows={4}
              placeholder="Tell us about yourself..."
            />
            {state.errors?.bio && (
              <p className="text-sm text-destructive">{state.errors.bio[0]}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {bioLength}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location || ''}
              maxLength={100}
              placeholder="City, Country"
            />
            {state.errors?.location && (
              <p className="text-sm text-destructive">{state.errors.location[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Add links to your social media profiles (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={profile.socialLinks?.website || ''}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              defaultValue={profile.socialLinks?.instagram || ''}
              placeholder="@username or profile URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              name="youtube"
              defaultValue={profile.socialLinks?.youtube || ''}
              placeholder="Channel URL or @handle"
            />
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
