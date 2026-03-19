'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '../../create/schema'

export type UpdateProductState = {
  error?: string
  errors?: {
    title?: string[]
    description?: string[]
    price?: string[]
    category?: string[]
    materials?: string[]
    shippingDays?: string[]
    shippingCost?: string[]
    type?: string[]
    stockQuantity?: string[]
    status?: string[]
    videoUrl?: string[]
    imageUrls?: string[]
  }
  success?: boolean
  values?: {
    title?: string
    description?: string
    price?: string
    category?: string
    materials?: string
    shippingDays?: string
    shippingCost?: string | null
    freeShipping?: string | null
    type?: string
    stockQuantity?: string
    status?: string
    videoUrl?: string
    imageUrls?: string
  }
}

export async function updateProductAction(
  productId: string,
  prevState: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized. Please log in.'
    }
  }

  // Check if product exists and user owns it
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { makerId: true }
  })

  if (!existingProduct) {
    return {
      error: 'Product not found.'
    }
  }

  if (existingProduct.makerId !== session.user.id) {
    return {
      error: 'You can only edit your own products.'
    }
  }

  const validatedFields = productSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    materials: formData.get('materials'),
    shippingDays: formData.get('shippingDays'),
    shippingCost: formData.get('shippingCost') || '',
    freeShipping: formData.get('freeShipping'),
    type: formData.get('type'),
    stockQuantity: formData.get('stockQuantity'),
    status: formData.get('status'),
    videoUrl: formData.get('videoUrl'),
    imageUrls: formData.get('imageUrls')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your inputs.',
      values: {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: formData.get('price') as string,
        category: formData.get('category') as string,
        materials: formData.get('materials') as string,
        shippingDays: formData.get('shippingDays') as string,
        shippingCost: formData.get('shippingCost') as string | null,
        freeShipping: formData.get('freeShipping') as string | null,
        type: formData.get('type') as string,
        stockQuantity: formData.get('stockQuantity') as string,
        status: formData.get('status') as string,
        videoUrl: formData.get('videoUrl') as string,
        imageUrls: formData.get('imageUrls') as string
      }
    }
  }

  const data = validatedFields.data

  try {
    // Parse category tags (comma-separated)
    const categoryArray = data.category
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    if (categoryArray.length === 0) {
      return {
        errors: { category: ['At least one category is required'] },
        error: 'Validation failed. Please check your inputs.',
        values: {
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          materials: data.materials,
          shippingDays: data.shippingDays,
          shippingCost: data.shippingCost,
          freeShipping: data.freeShipping,
          type: data.type,
          stockQuantity: data.stockQuantity,
          status: data.status,
          videoUrl: data.videoUrl,
          imageUrls: data.imageUrls
        }
      }
    }

    // Handle free shipping
    const isFreeShipping = data.freeShipping === 'on'
    const finalShippingCost = isFreeShipping ? 0 : (data.shippingCost ? parseFloat(data.shippingCost) : 0)

    // Update the product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        category: categoryArray,
        materials: data.materials || null,
        shippingDays: parseInt(data.shippingDays),
        shippingCost: finalShippingCost,
        freeShipping: isFreeShipping,
        type: data.type,
        stockQuantity: parseInt(data.stockQuantity),
        status: data.status,
        videoUrl: data.videoUrl || null
      },
      include: {
        maker: {
          include: {
            profile: true
          }
        }
      }
    })

    // Handle image URLs if provided (MVP placeholder)
    if (data.imageUrls) {
      const imageUrlArray = data.imageUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId }
      })

      // Create new ProductImage records
      if (imageUrlArray.length > 0) {
        await prisma.productImage.createMany({
          data: imageUrlArray.map((url, index) => ({
            productId: product.id,
            url,
            order: index,
            isPrimary: index === 0
          }))
        })
      }
    }

    // Get maker's slug for redirect
    const makerSlug = product.maker.profile?.profileSlug
    
    if (!makerSlug) {
      redirect('/dashboard/products')
    }

    redirect(`/maker/${makerSlug}/${product.id}`)
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Error updating product:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      error: `Failed to update product: ${errorMessage}`
    }
  }
}
