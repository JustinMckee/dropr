import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type SearchParams = Promise<{
  page?: string
}>

const PRODUCTS_PER_PAGE = 12

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE

  // Fetch active products with stock
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: 'active',
        stockQuantity: {
          gt: 0,
        },
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        maker: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({
      where: {
        status: 'active',
        stockQuantity: {
          gt: 0,
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Browse Products
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover unique handmade items from talented makers
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No products available at the moment
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for new listings!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary)
                const makerName =
                  product.maker.profile?.displayName ||
                  product.maker.profile?.shopName ||
                  'Unknown Maker'

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={Number(product.price)}
                    makerName={makerName}
                    primaryImage={primaryImage?.url}
                    status={product.status}
                    stockQuantity={product.stockQuantity}
                    freeShipping={product.freeShipping}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                {hasPreviousPage ? (
                  <Button asChild variant="outline">
                    <Link href={`/products?page=${currentPage - 1}`}>
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                )}

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                {hasNextPage ? (
                  <Button asChild variant="outline">
                    <Link href={`/products?page=${currentPage + 1}`}>Next</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Next
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
