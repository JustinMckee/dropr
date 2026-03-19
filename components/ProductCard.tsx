import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ProductCardProps = {
  id: string
  title: string
  price: number
  makerName: string
  primaryImage?: string
  status: string
  stockQuantity: number
  freeShipping: boolean
}

export function ProductCard({
  id,
  title,
  price,
  makerName,
  primaryImage,
  status,
  stockQuantity,
  freeShipping,
}: ProductCardProps) {
  const isSoldOut = status === 'sold_out' || stockQuantity === 0
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5

  return (
    <Link
      href={`/products/${id}`}
      className="group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-muted-foreground text-sm">No Image</span>
        )}
        
        {/* Status Badges */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-base px-4 py-2">
              Sold Out
            </Badge>
          </div>
        )}
        
        {!isSoldOut && isLowStock && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Only {stockQuantity} left
          </Badge>
        )}
        
        {freeShipping && !isSoldOut && (
          <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700">
            Free Shipping
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-lg group-hover:text-primary transition line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        {/* Maker */}
        <p className="text-sm text-muted-foreground">
          by {makerName}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold">${price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  )
}
