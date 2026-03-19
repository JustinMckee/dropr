import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test makers
  const password = await bcrypt.hash('password123', 10)

  const maker1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash: password,
      role: 'maker',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Alice Chen',
          profileSlug: 'alice-chen',
          shopName: 'Alice\'s Artisan Workshop',
          bio: 'Handcrafted ceramics and pottery with a modern twist',
          location: 'Portland, OR',
          categories: ['ceramics', 'pottery', 'home-decor'],
          reputationScore: 4.8,
          totalSales: 127,
        },
      },
    },
  })

  const maker2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash: password,
      role: 'maker',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Bob Martinez',
          profileSlug: 'bob-martinez',
          shopName: 'Martinez Leather Co.',
          bio: 'Premium leather goods, handmade with care',
          location: 'Austin, TX',
          categories: ['leather', 'accessories', 'bags'],
          reputationScore: 4.9,
          totalSales: 203,
        },
      },
    },
  })

  const maker3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      email: 'carol@example.com',
      passwordHash: password,
      role: 'maker',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Carol Kim',
          profileSlug: 'carol-kim',
          shopName: 'Pixel & Thread',
          bio: 'Digital art prints and custom illustrations',
          location: 'Brooklyn, NY',
          categories: ['art', 'prints', 'digital'],
          reputationScore: 4.7,
          totalSales: 89,
        },
      },
    },
  })

  console.log('✅ Created makers')

  // Create products for Alice
  const product1 = await prisma.product.create({
    data: {
      makerId: maker1.id,
      title: 'Handmade Ceramic Mug Set',
      description: 'Beautiful set of 4 handcrafted ceramic mugs. Each mug is wheel-thrown and glazed with a unique reactive glaze that creates stunning color variations. Perfect for your morning coffee or tea. Microwave and dishwasher safe.',
      price: 89.99,
      category: ['ceramics', 'kitchenware', 'home-decor'],
      materials: 'Stoneware clay, food-safe glaze',
      shippingDays: 3,
      shippingCost: 8.50,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 12,
      status: 'active',
      viewCount: 234,
      favoriteCount: 45,
      salesCount: 18,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product2 = await prisma.product.create({
    data: {
      makerId: maker1.id,
      title: 'Artisan Serving Bowl',
      description: 'Large serving bowl perfect for salads, pasta, or as a centerpiece. Hand-thrown on the pottery wheel with a beautiful speckled glaze finish. Each piece is one-of-a-kind.',
      price: 65.00,
      category: ['ceramics', 'kitchenware'],
      materials: 'Stoneware clay, reactive glaze',
      shippingDays: 5,
      shippingCost: 12.00,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 4,
      status: 'active',
      viewCount: 156,
      favoriteCount: 32,
      salesCount: 9,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product3 = await prisma.product.create({
    data: {
      makerId: maker1.id,
      title: 'Minimalist Vase Collection',
      description: 'Set of 3 minimalist ceramic vases in varying heights. Perfect for fresh or dried flowers. Modern design that complements any interior style.',
      price: 125.00,
      category: ['ceramics', 'home-decor'],
      materials: 'Porcelain, matte glaze',
      shippingDays: 7,
      shippingCost: 0,
      freeShipping: true,
      type: 'standard',
      stockQuantity: 8,
      status: 'active',
      viewCount: 189,
      favoriteCount: 67,
      salesCount: 12,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  console.log('✅ Created Alice\'s products')

  // Create products for Bob
  const product4 = await prisma.product.create({
    data: {
      makerId: maker2.id,
      title: 'Classic Leather Wallet',
      description: 'Handcrafted bifold wallet made from premium full-grain leather. Features 6 card slots, 2 bill compartments, and a hidden pocket. Ages beautifully with use. Comes with lifetime repair guarantee.',
      price: 78.00,
      category: ['leather', 'accessories', 'wallets'],
      materials: 'Full-grain leather, waxed thread',
      shippingDays: 2,
      shippingCost: 5.00,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 25,
      status: 'active',
      viewCount: 412,
      favoriteCount: 89,
      salesCount: 34,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product5 = await prisma.product.create({
    data: {
      makerId: maker2.id,
      title: 'Leather Messenger Bag',
      description: 'Spacious messenger bag perfect for work or travel. Features padded laptop compartment (fits up to 15"), multiple pockets, and adjustable shoulder strap. Made from vegetable-tanned leather that develops a rich patina over time.',
      price: 245.00,
      category: ['leather', 'bags', 'accessories'],
      materials: 'Vegetable-tanned leather, brass hardware',
      shippingDays: 5,
      shippingCost: 0,
      freeShipping: true,
      type: 'standard',
      stockQuantity: 6,
      status: 'active',
      viewCount: 567,
      favoriteCount: 123,
      salesCount: 28,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product6 = await prisma.product.create({
    data: {
      makerId: maker2.id,
      title: 'Leather Watch Strap',
      description: 'Handmade leather watch strap available in multiple colors. Fits standard 20mm and 22mm watch cases. Hand-stitched with waxed thread for durability.',
      price: 42.00,
      category: ['leather', 'accessories'],
      materials: 'Italian leather, waxed thread',
      shippingDays: 3,
      shippingCost: 4.00,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 18,
      status: 'active',
      viewCount: 298,
      favoriteCount: 54,
      salesCount: 41,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product7 = await prisma.product.create({
    data: {
      makerId: maker2.id,
      title: 'Custom Leather Journal',
      description: 'Personalized leather journal with refillable pages. Perfect for writers, artists, or anyone who loves to journal. Can be customized with initials or a short message.',
      price: 95.00,
      category: ['leather', 'stationery', 'gifts'],
      materials: 'Full-grain leather, recycled paper',
      shippingDays: 10,
      shippingCost: 6.00,
      freeShipping: false,
      type: 'preorder',
      stockQuantity: 15,
      status: 'active',
      viewCount: 445,
      favoriteCount: 98,
      salesCount: 22,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  console.log('✅ Created Bob\'s products')

  // Create products for Carol
  const product8 = await prisma.product.create({
    data: {
      makerId: maker3.id,
      title: 'Abstract Landscape Print',
      description: 'Limited edition giclée print of original digital artwork. Vibrant colors and modern composition. Printed on museum-quality archival paper. Signed and numbered by the artist.',
      price: 55.00,
      category: ['art', 'prints', 'wall-art'],
      materials: 'Archival paper, pigment ink',
      shippingDays: 4,
      shippingCost: 7.00,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 20,
      status: 'active',
      viewCount: 334,
      favoriteCount: 76,
      salesCount: 15,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product9 = await prisma.product.create({
    data: {
      makerId: maker3.id,
      title: 'Custom Pet Portrait',
      description: 'Digital illustration of your beloved pet! Send me a photo and I\'ll create a unique, stylized portrait. Delivered as high-resolution digital file, perfect for printing or sharing.',
      price: 120.00,
      category: ['art', 'digital', 'custom', 'gifts'],
      materials: 'Digital illustration',
      shippingDays: 14,
      shippingCost: 0,
      freeShipping: true,
      type: 'preorder',
      stockQuantity: 10,
      status: 'active',
      viewCount: 678,
      favoriteCount: 145,
      salesCount: 31,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  const product10 = await prisma.product.create({
    data: {
      makerId: maker3.id,
      title: 'Botanical Print Set',
      description: 'Set of 3 botanical illustrations featuring native plants. Modern minimalist style. Perfect for creating a gallery wall. Each print is 8x10 inches.',
      price: 75.00,
      category: ['art', 'prints', 'botanical'],
      materials: 'Premium matte paper',
      shippingDays: 3,
      shippingCost: 0,
      freeShipping: true,
      type: 'standard',
      stockQuantity: 30,
      status: 'active',
      viewCount: 523,
      favoriteCount: 112,
      salesCount: 27,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  // Add a limited drop product
  const product11 = await prisma.product.create({
    data: {
      makerId: maker3.id,
      title: 'Limited Edition: Cosmic Series',
      description: 'EXCLUSIVE DROP: Limited to 50 prints only! Part of the Cosmic Series featuring stunning space-inspired artwork. Once they\'re gone, they\'re gone forever. Each print comes with a certificate of authenticity.',
      price: 150.00,
      category: ['art', 'prints', 'limited-edition'],
      materials: 'Fine art paper, archival ink',
      shippingDays: 2,
      shippingCost: 0,
      freeShipping: true,
      type: 'drop',
      stockQuantity: 3,
      status: 'active',
      viewCount: 892,
      favoriteCount: 234,
      salesCount: 47,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  // Add a sold out product
  const product12 = await prisma.product.create({
    data: {
      makerId: maker1.id,
      title: 'Vintage-Style Dinner Plates',
      description: 'Set of 6 dinner plates with vintage-inspired design. SOLD OUT - Check back for restock!',
      price: 145.00,
      category: ['ceramics', 'kitchenware'],
      materials: 'Stoneware clay',
      shippingDays: 5,
      shippingCost: 15.00,
      freeShipping: false,
      type: 'standard',
      stockQuantity: 0,
      status: 'sold_out',
      viewCount: 456,
      favoriteCount: 89,
      salesCount: 24,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
            order: 0,
            isPrimary: true,
          },
        ],
      },
    },
  })

  console.log('✅ Created Carol\'s products')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('  - 3 makers created')
  console.log('  - 12 products created')
  console.log('  - Test credentials: email@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
