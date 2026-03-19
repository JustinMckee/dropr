import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ProductImageGallery } from './ProductImageGallery'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params

  // Fetch product with maker details
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      maker: {
        include: {
          profile: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // Increment view count (fire and forget)
  prisma.product
    .update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      // Silently fail - view count is not critical
    })

  const makerName =
    product.maker.profile?.shopName ||
    product.maker.profile?.displayName ||
    'Unknown Maker'
  const makerSlug = product.maker.profile?.profileSlug

  const isSoldOut = product.status === 'sold_out' || product.stockQuantity === 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5
  const isAvailable = product.status === 'active' && product.stockQuantity > 0

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            <ProductImageGallery
              images={product.images.map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary,
              }))}
              title={product.title}
            />
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Product Type Badge */}
            {product.type !== 'standard' && (
              <div>
                <Badge variant="secondary" className="text-sm">
                  {product.type === 'preorder' ? 'Pre-order' : 'Drop'}
                </Badge>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {product.title}
              </h1>

              {/* Maker Link */}
              {makerSlug ? (
                <Link
                  href={`/maker/${makerSlug}`}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  by {makerName}
                </Link>
              ) : (
                <p className="text-muted-foreground">by {makerName}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.freeShipping && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  Free Shipping
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {isSoldOut ? (
                <Badge variant="destructive" className="text-base px-4 py-2">
                  Sold Out
                </Badge>
              ) : isLowStock ? (
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Only {product.stockQuantity} left in stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-base px-4 py-2">
                  In Stock ({product.stockQuantity} available)
                </Badge>
              )}
            </div>

            {/* Add to Cart / Buy Button */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                disabled={!isAvailable}
              >
                {isSoldOut ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Checkout and payment coming soon
              </p>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Shipping Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Delivery:
                    </span>
                    <span className="font-medium">
                      {product.shippingDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Cost:</span>
                    <span className="font-medium">
                      {product.freeShipping
                        ? 'Free'
                        : `$${Number(product.shippingCost).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Materials */}
            {product.materials && (
              <div>
                <h3 className="font-semibold mb-2">Materials</h3>
                <p className="text-muted-foreground">{product.materials}</p>
              </div>
            )}

            {/* Categories */}
            {product.category.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.category.map((cat) => (
                    <Badge key={cat} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
