import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be 2000 characters or less'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number'
  }),
  category: z.string().min(1, 'At least one category is required'),
  materials: z.string().optional().or(z.literal('')),
  shippingDays: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Shipping days must be a non-negative number'
  }),
  shippingCost: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true
    return !isNaN(parseFloat(val)) && parseFloat(val) >= 0
  }, {
    message: 'Shipping cost must be a non-negative number'
  }),
  freeShipping: z.string().optional().or(z.literal('on')).or(z.null()),
  type: z.enum(['standard', 'preorder', 'drop']),
  stockQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Stock quantity must be a non-negative number'
  }),
  status: z.enum(['draft', 'active', 'archived']),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrls: z.string().optional().or(z.literal(''))
})
