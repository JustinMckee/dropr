import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProductCreateForm } from './ProductCreateForm'

export default async function ProductCreatePage() {
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

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
      <ProductCreateForm />
    </div>
  )
}
