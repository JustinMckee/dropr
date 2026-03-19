'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export type ArchiveProductState = {
  error?: string
  success?: boolean
}

export async function archiveProductAction(
  prevState: ArchiveProductState,
  formData: FormData
): Promise<ArchiveProductState> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized. Please log in.'
    }
  }

  const productId = formData.get('productId') as string

  if (!productId) {
    return {
      error: 'Product ID is required.'
    }
  }

  try {
    // Verify the product belongs to the current user
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { makerId: true }
    })

    if (!product) {
      return {
        error: 'Product not found.'
      }
    }

    if (product.makerId !== session.user.id) {
      return {
        error: 'You do not have permission to archive this product.'
      }
    }

    // Archive the product
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'archived' }
    })

    revalidatePath('/dashboard/products')
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error archiving product:', error)
    return {
      error: 'Failed to archive product. Please try again.'
    }
  }
}

export async function unarchiveProductAction(
  prevState: ArchiveProductState,
  formData: FormData
): Promise<ArchiveProductState> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized. Please log in.'
    }
  }

  const productId = formData.get('productId') as string

  if (!productId) {
    return {
      error: 'Product ID is required.'
    }
  }

  try {
    // Verify the product belongs to the current user
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { makerId: true, stockQuantity: true }
    })

    if (!product) {
      return {
        error: 'Product not found.'
      }
    }

    if (product.makerId !== session.user.id) {
      return {
        error: 'You do not have permission to unarchive this product.'
      }
    }

    // Determine the new status based on stock quantity
    const newStatus = product.stockQuantity > 0 ? 'active' : 'sold_out'

    // Unarchive the product
    await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus }
    })

    revalidatePath('/dashboard/products')
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error unarchiving product:', error)
    return {
      error: 'Failed to unarchive product. Please try again.'
    }
  }
}
