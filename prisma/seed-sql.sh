#!/bin/bash

# Seed script using raw SQL to avoid Prisma adapter issues

psql -U postgres -d dropr << 'EOF'

-- Clear existing data
TRUNCATE "Category", "Tag" CASCADE;

-- Seed MOD Categories
INSERT INTO "Category" (id, name, slug, collective, description, icon, "order", "createdAt", "updatedAt") VALUES
('mod-cat-1', 'Keyboards & Accessories', 'keyboards-accessories', 'MOD', 'Mechanical keyboards, keycaps, switches, and accessories', '⌨️', 1, NOW(), NOW()),
('mod-cat-2', 'PC Building & Mods', 'pc-building-mods', 'MOD', 'PC components, cases, cooling, and custom modifications', '🖥️', 2, NOW(), NOW()),
('mod-cat-3', 'Gaming Gear', 'gaming-gear', 'MOD', 'Gaming peripherals, controllers, and accessories', '🎮', 3, NOW(), NOW()),
('mod-cat-4', 'Other Mods', 'other-mods', 'MOD', 'Other modding and customization items', '🔧', 4, NOW(), NOW());

-- Seed MAKE Categories
INSERT INTO "Category" (id, name, slug, collective, description, icon, "order", "createdAt", "updatedAt") VALUES
('make-cat-1', 'Electronics & Circuits', 'electronics-circuits', 'MAKE', 'Electronic components, PCBs, sensors, and circuits', '⚡', 1, NOW(), NOW()),
('make-cat-2', 'Audio & Instruments', 'audio-instruments', 'MAKE', 'Modular synths, pedals, audio equipment, and instruments', '🎵', 2, NOW(), NOW()),
('make-cat-3', '3D Printing & Fabrication', '3d-printing-fabrication', 'MAKE', '3D printing materials, tools, and fabrication supplies', '🖨️', 3, NOW(), NOW()),
('make-cat-4', 'Tools & Materials', 'tools-materials', 'MAKE', 'Maker tools, materials, and general supplies', '🔨', 4, NOW(), NOW());

-- Seed MINI Categories
INSERT INTO "Category" (id, name, slug, collective, description, icon, "order", "createdAt", "updatedAt") VALUES
('mini-cat-1', 'Miniatures & Figures', 'miniatures-figures', 'MINI', 'Miniature figures, characters, and collectibles', '🎭', 1, NOW(), NOW()),
('mini-cat-2', 'Model Kits', 'model-kits', 'MINI', 'Model kits, vehicles, buildings, and structures', '🏗️', 2, NOW(), NOW()),
('mini-cat-3', 'Paints & Supplies', 'paints-supplies', 'MINI', 'Paints, brushes, tools, and painting supplies', '🎨', 3, NOW(), NOW()),
('mini-cat-4', 'Terrain & Accessories', 'terrain-accessories', 'MINI', 'Terrain pieces, bases, and gaming accessories', '🏔️', 4, NOW(), NOW());

-- Seed Tags
INSERT INTO "Tag" (id, name, slug, type, "createdAt", "updatedAt") VALUES
-- General
('tag-1', 'Custom', 'custom', 'GENERAL', NOW(), NOW()),
('tag-2', 'Limited Edition', 'limited-edition', 'GENERAL', NOW(), NOW()),
('tag-3', 'Rare', 'rare', 'GENERAL', NOW(), NOW()),
('tag-4', 'Vintage', 'vintage', 'GENERAL', NOW(), NOW()),
('tag-5', 'New', 'new', 'GENERAL', NOW(), NOW()),
('tag-6', 'Used', 'used', 'GENERAL', NOW(), NOW()),
-- Material
('tag-7', 'Metal', 'metal', 'MATERIAL', NOW(), NOW()),
('tag-8', 'Plastic', 'plastic', 'MATERIAL', NOW(), NOW()),
('tag-9', 'Resin', 'resin', 'MATERIAL', NOW(), NOW()),
('tag-10', 'Wood', 'wood', 'MATERIAL', NOW(), NOW()),
('tag-11', 'Acrylic', 'acrylic', 'MATERIAL', NOW(), NOW()),
('tag-12', 'PLA', 'pla', 'MATERIAL', NOW(), NOW()),
('tag-13', 'ABS', 'abs', 'MATERIAL', NOW(), NOW()),
-- Color
('tag-14', 'Black', 'black', 'COLOR', NOW(), NOW()),
('tag-15', 'White', 'white', 'COLOR', NOW(), NOW()),
('tag-16', 'RGB', 'rgb', 'COLOR', NOW(), NOW()),
('tag-17', 'Custom Color', 'custom-color', 'COLOR', NOW(), NOW()),
('tag-18', 'Transparent', 'transparent', 'COLOR', NOW(), NOW()),
-- Theme
('tag-19', 'Cyberpunk', 'cyberpunk', 'THEME', NOW(), NOW()),
('tag-20', 'Retro', 'retro', 'THEME', NOW(), NOW()),
('tag-21', 'Minimalist', 'minimalist', 'THEME', NOW(), NOW()),
('tag-22', 'Tactical', 'tactical', 'THEME', NOW(), NOW()),
('tag-23', 'Fantasy', 'fantasy', 'THEME', NOW(), NOW()),
('tag-24', 'Sci-Fi', 'sci-fi', 'THEME', NOW(), NOW()),
-- Skill Level
('tag-25', 'Beginner', 'beginner', 'SKILL_LEVEL', NOW(), NOW()),
('tag-26', 'Intermediate', 'intermediate', 'SKILL_LEVEL', NOW(), NOW()),
('tag-27', 'Advanced', 'advanced', 'SKILL_LEVEL', NOW(), NOW()),
('tag-28', 'Expert', 'expert', 'SKILL_LEVEL', NOW(), NOW());

SELECT 'Database seeded successfully!' as message;

EOF
