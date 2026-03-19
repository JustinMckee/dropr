import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProductEditForm } from './ProductEditForm'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductEditPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch the product with images
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!product) {
    redirect('/dashboard/products')
  }

  // Check if user owns this product
  if (product.makerId !== session.user.id) {
    redirect('/dashboard/products')
  }

  // Convert Decimal to number for client component
  const productData = {
    ...product,
    price: Number(product.price),
    shippingCost: Number(product.shippingCost)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-2">
          Update your product listing details
        </p>
      </div>

      <ProductEditForm product={productData} />
    </div>
  )
}
