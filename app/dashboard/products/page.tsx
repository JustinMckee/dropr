import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from './ProductCard'

export default async function ProductsDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user is a maker
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (user?.role !== 'maker') {
    redirect('/')
  }

  // Fetch all products for this maker
  const products = await prisma.product.findMany({
    where: {
      makerId: session.user.id
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize Decimal fields for Client Component
  const serializedProducts = products.map(product => ({
    ...product,
    price: product.price.toString(),
    shippingCost: product.shippingCost.toString()
  }))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product listings
          </p>
        </div>
        <Link href="/dashboard/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>

      {serializedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven't created any products yet.
          </p>
          <Link href="/dashboard/products/create">
            <Button>Create Your First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
