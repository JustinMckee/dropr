import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Categories for MOD Collective
  const modCategories = [
    {
      name: 'Keyboards & Accessories',
      slug: 'keyboards-accessories',
      collective: 'MOD' as const,
      description: 'Mechanical keyboards, keycaps, switches, and accessories',
      icon: '⌨️',
      order: 1,
    },
    {
      name: 'PC Building & Mods',
      slug: 'pc-building-mods',
      collective: 'MOD' as const,
      description: 'PC components, cases, cooling, and custom modifications',
      icon: '🖥️',
      order: 2,
    },
    {
      name: 'Gaming Gear',
      slug: 'gaming-gear',
      collective: 'MOD' as const,
      description: 'Gaming peripherals, controllers, and accessories',
      icon: '🎮',
      order: 3,
    },
    {
      name: 'Other Mods',
      slug: 'other-mods',
      collective: 'MOD' as const,
      description: 'Other modding and customization items',
      icon: '🔧',
      order: 4,
    },
  ];

  // Seed Categories for MAKE Collective
  const makeCategories = [
    {
      name: 'Electronics & Circuits',
      slug: 'electronics-circuits',
      collective: 'MAKE' as const,
      description: 'Electronic components, PCBs, sensors, and circuits',
      icon: '⚡',
      order: 1,
    },
    {
      name: 'Audio & Instruments',
      slug: 'audio-instruments',
      collective: 'MAKE' as const,
      description: 'Modular synths, pedals, audio equipment, and instruments',
      icon: '🎵',
      order: 2,
    },
    {
      name: '3D Printing & Fabrication',
      slug: '3d-printing-fabrication',
      collective: 'MAKE' as const,
      description: '3D printing materials, tools, and fabrication supplies',
      icon: '🖨️',
      order: 3,
    },
    {
      name: 'Tools & Materials',
      slug: 'tools-materials',
      collective: 'MAKE' as const,
      description: 'Maker tools, materials, and general supplies',
      icon: '🔨',
      order: 4,
    },
  ];

  // Seed Categories for MINI Collective
  const miniCategories = [
    {
      name: 'Miniatures & Figures',
      slug: 'miniatures-figures',
      collective: 'MINI' as const,
      description: 'Miniature figures, characters, and collectibles',
      icon: '🎭',
      order: 1,
    },
    {
      name: 'Model Kits',
      slug: 'model-kits',
      collective: 'MINI' as const,
      description: 'Model kits, vehicles, buildings, and structures',
      icon: '🏗️',
      order: 2,
    },
    {
      name: 'Paints & Supplies',
      slug: 'paints-supplies',
      collective: 'MINI' as const,
      description: 'Paints, brushes, tools, and painting supplies',
      icon: '🎨',
      order: 3,
    },
    {
      name: 'Terrain & Accessories',
      slug: 'terrain-accessories',
      collective: 'MINI' as const,
      description: 'Terrain pieces, bases, and gaming accessories',
      icon: '🏔️',
      order: 4,
    },
  ];

  console.log('Creating categories...');
  for (const category of [...modCategories, ...makeCategories, ...miniCategories]) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log('✅ Categories created');

  // Seed Tags (cross-collective)
  const tags = [
    // General tags
    { name: 'Custom', slug: 'custom', type: 'GENERAL' as const },
    { name: 'Limited Edition', slug: 'limited-edition', type: 'GENERAL' as const },
    { name: 'Rare', slug: 'rare', type: 'GENERAL' as const },
    { name: 'Vintage', slug: 'vintage', type: 'GENERAL' as const },
    { name: 'New', slug: 'new', type: 'GENERAL' as const },
    { name: 'Used', slug: 'used', type: 'GENERAL' as const },
    
    // Material tags
    { name: 'Metal', slug: 'metal', type: 'MATERIAL' as const },
    { name: 'Plastic', slug: 'plastic', type: 'MATERIAL' as const },
    { name: 'Resin', slug: 'resin', type: 'MATERIAL' as const },
    { name: 'Wood', slug: 'wood', type: 'MATERIAL' as const },
    { name: 'Acrylic', slug: 'acrylic', type: 'MATERIAL' as const },
    { name: 'PLA', slug: 'pla', type: 'MATERIAL' as const },
    { name: 'ABS', slug: 'abs', type: 'MATERIAL' as const },
    
    // Color tags
    { name: 'Black', slug: 'black', type: 'COLOR' as const },
    { name: 'White', slug: 'white', type: 'COLOR' as const },
    { name: 'RGB', slug: 'rgb', type: 'COLOR' as const },
    { name: 'Custom Color', slug: 'custom-color', type: 'COLOR' as const },
    { name: 'Transparent', slug: 'transparent', type: 'COLOR' as const },
    
    // Theme tags
    { name: 'Cyberpunk', slug: 'cyberpunk', type: 'THEME' as const },
    { name: 'Retro', slug: 'retro', type: 'THEME' as const },
    { name: 'Minimalist', slug: 'minimalist', type: 'THEME' as const },
    { name: 'Tactical', slug: 'tactical', type: 'THEME' as const },
    { name: 'Fantasy', slug: 'fantasy', type: 'THEME' as const },
    { name: 'Sci-Fi', slug: 'sci-fi', type: 'THEME' as const },
    
    // Skill Level tags
    { name: 'Beginner', slug: 'beginner', type: 'SKILL_LEVEL' as const },
    { name: 'Intermediate', slug: 'intermediate', type: 'SKILL_LEVEL' as const },
    { name: 'Advanced', slug: 'advanced', type: 'SKILL_LEVEL' as const },
    { name: 'Expert', slug: 'expert', type: 'SKILL_LEVEL' as const },
  ];

  console.log('Creating tags...');
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log('✅ Tags created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
