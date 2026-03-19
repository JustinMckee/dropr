'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { upgradeToMakerAction, type MakerSetupState } from './actions'

interface Profile {
  id: string
  userId: string
  displayName: string
  shopName: string | null
  shopBanner: string | null
  categories: string[]
}

interface MakerSetupFormProps {
  userId: string
  profile: Profile | null
}

const AVAILABLE_CATEGORIES = [
  'Mechanical keyboard',
  '3D printing',
  'synth',
  'electronics',
  'miniatures',
  'woodworking',
  'jewelry',
  'art',
  'clothing',
  'accessories'
]

export function MakerSetupForm({ userId, profile }: MakerSetupFormProps) {
  const [state, formAction, isPending] = useActionState<MakerSetupState, FormData>(
    upgradeToMakerAction,
    {}
  )

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile?.categories || []
  )

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="categories" value={JSON.stringify(selectedCategories)} />

      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Tell buyers about your shop and what you create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name *</Label>
            <Input
              id="shopName"
              name="shopName"
              defaultValue={profile?.shopName || ''}
              required
              maxLength={100}
              placeholder="Your shop name"
            />
            {state.errors?.shopName && (
              <p className="text-sm text-destructive">{state.errors.shopName[0]}</p>
            )}
            <p className="text-sm text-muted-foreground">
              This will be displayed on your products and shop page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopBanner">Shop Banner URL</Label>
            <Input
              id="shopBanner"
              name="shopBanner"
              type="url"
              defaultValue={profile?.shopBanner || ''}
              placeholder="https://example.com/banner.jpg"
            />
            {state.errors?.shopBanner && (
              <p className="text-sm text-destructive">{state.errors.shopBanner[0]}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Add a banner image for your shop (optional). Image upload coming soon!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Categories *</CardTitle>
          <CardDescription>
            Select the categories that best describe what you make (select at least one)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
          {state.errors?.categories && (
            <p className="text-sm text-destructive mt-2">{state.errors.categories[0]}</p>
          )}
        </CardContent>
      </Card>

      {state.error && (
        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
          Welcome to the maker community! Redirecting to your profile...
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Setting up...' : 'Become a Maker'}
        </Button>
      </div>
    </form>
  )
}
