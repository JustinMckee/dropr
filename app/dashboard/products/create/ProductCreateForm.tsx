'use client'

import { useActionState, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { createProductAction, type CreateProductState } from './actions'
import { productSchema } from './schema'
import { z } from 'zod'

type ClientErrors = {
  [key: string]: string | undefined
}

export function ProductCreateForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<CreateProductState, FormData>(
    createProductAction,
    {}
  )

  const [descriptionLength, setDescriptionLength] = useState(0)
  const [freeShipping, setFreeShipping] = useState(false)
  const [clientErrors, setClientErrors] = useState<ClientErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  // Debounce timer ref
  const debounceTimers = useState<{ [key: string]: NodeJS.Timeout }>({})[0]

  const validateField = useCallback((fieldName: string, value: string) => {
    try {
      // Create a partial object with just this field to validate
      const partialData = { ...formValues, [fieldName]: value }
      
      // Use safeParse with the full schema to get field-specific errors
      const result = productSchema.safeParse(partialData)
      
      if (result.success) {
        // Clear error if validation passes for this field
        setClientErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      } else {
        // Check if there's an error for this specific field
        const fieldError = result.error.issues.find((err: z.ZodIssue) => err.path[0] === fieldName)
        if (fieldError) {
          setClientErrors(prev => ({
            ...prev,
            [fieldName]: fieldError.message
          }))
        } else {
          // Clear error if no error for this field
          setClientErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
        }
      }
    } catch (error: any) {
      console.error('Validation error:', error)
    }
  }, [formValues])

  const handleBlur = useCallback((fieldName: string, value: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    setFormValues(prev => ({ ...prev, [fieldName]: value }))
    validateField(fieldName, value)
  }, [validateField])

  const handleChange = useCallback((fieldName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }))
    
    // Only validate if field has been touched
    if (touchedFields.has(fieldName)) {
      // Clear existing timer
      if (debounceTimers[fieldName]) {
        clearTimeout(debounceTimers[fieldName])
      }
      
      // Set new timer
      debounceTimers[fieldName] = setTimeout(() => {
        validateField(fieldName, value)
      }, 300)
    }
  }, [touchedFields, validateField, debounceTimers])

  // Merge server and client errors
  const getFieldError = (fieldName: string) => {
    return clientErrors[fieldName] || (state.errors?.[fieldName as keyof typeof state.errors]?.[0])
  }

  const hasFieldError = (fieldName: string) => {
    return !!(clientErrors[fieldName] || state.errors?.[fieldName as keyof typeof state.errors])
  }

  return (
    <form action={formAction} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the core details about your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              name="title"
              maxLength={100}
              placeholder="Enter product title"
              defaultValue={state.values?.title || ''}
              className={hasFieldError('title') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('title', e.target.value)}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            {getFieldError('title') && (
              <p className="text-sm text-destructive">{getFieldError('title')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              onChange={(e) => {
                setDescriptionLength(e.target.value.length)
                handleChange('description', e.target.value)
              }}
              onBlur={(e) => handleBlur('description', e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Describe your product in detail..."
              defaultValue={state.values?.description || ''}
              className={hasFieldError('description') ? '!border-destructive' : ''}
            />
            {getFieldError('description') && (
              <p className="text-sm text-destructive">{getFieldError('description')}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {descriptionLength}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={state.values?.price || ''}
              className={hasFieldError('price') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('price', e.target.value)}
              onChange={(e) => handleChange('price', e.target.value)}
            />
            {getFieldError('price') && (
              <p className="text-sm text-destructive">{getFieldError('price')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Product Type *</Label>
            <select
              id="type"
              name="type"
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${hasFieldError('type') ? '!border-destructive' : ''}`}
              defaultValue={state.values?.type || 'standard'}
              onBlur={(e) => handleBlur('type', e.target.value)}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="standard">Standard - Regular inventory item</option>
              <option value="preorder">Pre-order - Future delivery, payment upfront</option>
              <option value="drop">Drop - Limited quantity, timed release</option>
            </select>
            {getFieldError('type') && (
              <p className="text-sm text-destructive">{getFieldError('type')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock Quantity *</Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={state.values?.stockQuantity || '0'}
              className={hasFieldError('stockQuantity') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('stockQuantity', e.target.value)}
              onChange={(e) => handleChange('stockQuantity', e.target.value)}
            />
            {getFieldError('stockQuantity') && (
              <p className="text-sm text-destructive">{getFieldError('stockQuantity')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              name="status"
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${hasFieldError('status') ? '!border-destructive' : ''}`}
              defaultValue={state.values?.status || 'draft'}
              onBlur={(e) => handleBlur('status', e.target.value)}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="draft">Draft - Not visible to buyers</option>
              <option value="active">Active - Visible in marketplace</option>
            </select>
            {getFieldError('status') && (
              <p className="text-sm text-destructive">{getFieldError('status')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Categories & Details</CardTitle>
          <CardDescription>
            Help buyers find your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category Tags *</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., jewelry, handmade, vintage (comma-separated)"
              defaultValue={state.values?.category || ''}
              className={hasFieldError('category') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('category', e.target.value)}
              onChange={(e) => handleChange('category', e.target.value)}
            />
            {getFieldError('category') && (
              <p className="text-sm text-destructive">{getFieldError('category')}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter tags separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials / Specifications</Label>
            <Textarea
              id="materials"
              name="materials"
              rows={3}
              placeholder="List materials used or product specifications..."
              defaultValue={state.values?.materials || ''}
              className={hasFieldError('materials') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('materials', e.target.value)}
              onChange={(e) => handleChange('materials', e.target.value)}
            />
            {getFieldError('materials') && (
              <p className="text-sm text-destructive">{getFieldError('materials')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
          <CardDescription>
            Set shipping details for this product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingDays">Estimated Shipping Time (days) *</Label>
            <Input
              id="shippingDays"
              name="shippingDays"
              type="number"
              min="0"
              placeholder="7"
              defaultValue={state.values?.shippingDays || '7'}
              className={hasFieldError('shippingDays') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('shippingDays', e.target.value)}
              onChange={(e) => handleChange('shippingDays', e.target.value)}
            />
            {getFieldError('shippingDays') && (
              <p className="text-sm text-destructive">{getFieldError('shippingDays')}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="freeShipping"
              name="freeShipping"
              checked={freeShipping}
              onCheckedChange={(checked) => setFreeShipping(checked === true)}
            />
            <Label htmlFor="freeShipping" className="cursor-pointer">
              Free Shipping
            </Label>
          </div>

          {!freeShipping && (
            <div className="space-y-2">
              <Label htmlFor="shippingCost">Shipping Cost (USD) *</Label>
              <Input
                id="shippingCost"
                name="shippingCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={state.values?.shippingCost || '0.00'}
                className={hasFieldError('shippingCost') ? '!border-destructive' : ''}
                onBlur={(e) => handleBlur('shippingCost', e.target.value)}
                onChange={(e) => handleChange('shippingCost', e.target.value)}
              />
              {getFieldError('shippingCost') && (
                <p className="text-sm text-destructive">{getFieldError('shippingCost')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Add images and video for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrls">Product Images (URLs)</Label>
            <Textarea
              id="imageUrls"
              name="imageUrls"
              rows={4}
              placeholder="Enter image URLs, one per line (min 1, max 8)&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              defaultValue={state.values?.imageUrls || ''}
              className={hasFieldError('imageUrls') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('imageUrls', e.target.value)}
              onChange={(e) => handleChange('imageUrls', e.target.value)}
            />
            {getFieldError('imageUrls') && (
              <p className="text-sm text-destructive">{getFieldError('imageUrls')}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Image upload feature coming soon! For now, enter image URLs (one per line)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (optional)</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://example.com/video.mp4"
              defaultValue={state.values?.videoUrl || ''}
              className={hasFieldError('videoUrl') ? '!border-destructive' : ''}
              onBlur={(e) => handleBlur('videoUrl', e.target.value)}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
            />
            {getFieldError('videoUrl') && (
              <p className="text-sm text-destructive">{getFieldError('videoUrl')}</p>
            )}
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
          Product created successfully! Redirecting...
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Product'}
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
