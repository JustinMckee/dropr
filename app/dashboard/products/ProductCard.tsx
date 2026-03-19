'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useActionState } from 'react'
import type { ArchiveProductState } from './actions'
import { archiveProductAction, unarchiveProductAction } from './actions'

type ProductWithImages = {
  id: string
  title: string
  price: string
  status: string
  stockQuantity: number
  viewCount: number
  favoriteCount: number
  salesCount: number
  images: Array<{
    url: string
    isPrimary: boolean
  }>
}

type ProductCardProps = {
  product: ProductWithImages
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [archiveState, archiveAction, isArchiving] = useActionState<ArchiveProductState, FormData>(
    archiveProductAction,
    {}
  )
  
  const [unarchiveState, unarchiveAction, isUnarchiving] = useActionState<ArchiveProductState, FormData>(
    unarchiveProductAction,
    {}
  )

  const primaryImage = product.images[0]?.url
  const isArchived = product.status === 'archived'
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5
  const isOutOfStock = product.stockQuantity === 0

  const getStatusBadge = () => {
    switch (product.status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draft</span>
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
      case 'archived':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Archived</span>
      case 'sold_out':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Sold Out</span>
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
      </div>

      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-2xl font-bold mb-3">${Number(product.price).toFixed(2)}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stock:</span>
            <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : ''}`}>
              {product.stockQuantity} {isLowStock && !isOutOfStock && '⚠️'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Views:</span>
            <span>{product.viewCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Favorites:</span>
            <span>{product.favoriteCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sales:</span>
            <span>{product.salesCount}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            Edit
          </Button>
        </Link>
        
        {isArchived ? (
          <form action={unarchiveAction} className="flex-1">
            <input type="hidden" name="productId" value={product.id} />
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full" 
              size="sm"
              disabled={isUnarchiving}
            >
              {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
            </Button>
          </form>
        ) : (
          <form action={archiveAction} className="flex-1">
            <input type="hidden" name="productId" value={product.id} />
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full" 
              size="sm"
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </Button>
          </form>
        )}
      </CardFooter>

      {(archiveState.error || unarchiveState.error) && (
        <div className="px-4 pb-4">
          <p className="text-sm text-destructive">
            {archiveState.error || unarchiveState.error}
          </p>
        </div>
      )}
    </Card>
  )
}
