-- Seed test users, curators, and drops for homepage testing

-- Create test users
INSERT INTO "User" (id, email, name, role, "emailVerified", "createdAt", "updatedAt") VALUES
('user-1', 'curator1@example.com', 'KeyMaster Pro', 'CURATOR', NOW(), NOW(), NOW()),
('user-2', 'curator2@example.com', 'Circuit Wizard', 'CURATOR', NOW(), NOW(), NOW()),
('user-3', 'curator3@example.com', 'Mini Painter', 'CURATOR', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create curators
INSERT INTO "Curator" (id, "userId", "businessName", slug, bio, "reputationScore", "totalDrops", "completedDrops", "averageRating", "stripeOnboarded", "createdAt", "updatedAt") VALUES
('curator-1', 'user-1', 'KeyMaster Workshop', 'keymaster-pro', 'Mechanical keyboard enthusiast with 10+ years of experience. Specializing in custom builds and rare switches.', 9.50, 25, 23, 4.80, false, NOW(), NOW()),
('curator-2', 'user-2', 'Circuit Lab', 'circuit-wizard', 'Electronics maker and modular synth builder. Creating unique audio experiences through DIY electronics.', 8.80, 18, 16, 4.60, false, NOW(), NOW()),
('curator-3', 'user-3', 'Miniature Masters', 'mini-painter', 'Professional miniature painter and terrain builder. Bringing tabletop worlds to life.', 9.20, 30, 28, 4.90, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create featured drops (LIVE status)
INSERT INTO "Drop" (
  id, "curatorId", title, slug, description, theme, type, collective, "categoryId",
  price, "minValue", inventory, sold, reserved, "coverImage", status,
  "startTime", duration, "endTime", "isFeatured", "featuredAt", "moderationStatus",
  "createdAt", "updatedAt"
) VALUES
(
  'drop-1', 'curator-1', 'Mechanical Keyboard Mystery Box - Enthusiast Tier',
  'mech-keyboard-mystery-enthusiast',
  'Hand-picked switches and keycaps from my personal collection. Every box includes at least 70 switches (mix of linear, tactile, or clicky), 1-2 artisan keycaps, and surprise extras from recent group buys. Minimum value: $75.',
  'Premium Keyboard Components', 'MYSTERY_BOX', 'MOD', 'mod-cat-1',
  49.99, 75.00, 45, 5, 0,
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  'LIVE',
  NOW() - INTERVAL '1 hour', 172800, NOW() + INTERVAL '47 hours',
  true, NOW(), 'APPROVED',
  NOW(), NOW()
),
(
  'drop-2', 'curator-2', 'DIY Modular Synth Starter Kit',
  'modular-synth-starter',
  'Everything you need to start your modular synth journey. Includes PCBs, components, and detailed build guide. Perfect for intermediate makers.',
  'Electronic Music Making', 'LIMITED_EDITION', 'MAKE', 'make-cat-2',
  89.99, 120.00, 20, 8, 2,
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
  'LIVE',
  NOW() - INTERVAL '2 hours', 259200, NOW() + INTERVAL '70 hours',
  true, NOW(), 'APPROVED',
  NOW(), NOW()
),
(
  'drop-3', 'curator-3', 'Fantasy Miniatures Collection',
  'fantasy-minis-collection',
  'Curated set of 10 unpainted fantasy miniatures from various manufacturers. Includes heroes, monsters, and NPCs. Perfect for D&D campaigns.',
  'Fantasy RPG', 'SURPLUS', 'MINI', 'mini-cat-1',
  34.99, 50.00, 30, 12, 3,
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800',
  'LIVE',
  NOW() - INTERVAL '30 minutes', 86400, NOW() + INTERVAL '23.5 hours',
  true, NOW(), 'APPROVED',
  NOW(), NOW()
);

-- Create upcoming drops (SCHEDULED status)
INSERT INTO "Drop" (
  id, "curatorId", title, slug, description, theme, type, collective, "categoryId",
  price, "minValue", inventory, sold, reserved, "coverImage", status,
  "startTime", duration, "endTime", "isFeatured", "moderationStatus",
  "createdAt", "updatedAt"
) VALUES
(
  'drop-4', 'curator-1', 'Custom Keycap Set - Cyberpunk Edition',
  'keycap-cyberpunk',
  'Limited run of custom keycaps with cyberpunk theme. PBT material, dye-sublimated legends. Compatible with Cherry MX switches.',
  'Cyberpunk Aesthetic', 'LIMITED_EDITION', 'MOD', 'mod-cat-1',
  79.99, 79.99, 50, 0, 0,
  'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
  'SCHEDULED',
  NOW() + INTERVAL '6 hours', 172800, NOW() + INTERVAL '54 hours',
  false, 'APPROVED',
  NOW(), NOW()
),
(
  'drop-5', 'curator-2', '3D Printer Upgrade Bundle',
  '3d-printer-upgrade',
  'Upgrade your 3D printer with this curated bundle. Includes nozzles, belts, bearings, and quality-of-life improvements.',
  'Printer Enhancement', 'SURPLUS', 'MAKE', 'make-cat-3',
  44.99, 65.00, 25, 0, 0,
  'https://images.unsplash.com/photo-1636690598896-0c4b9a5e8c82?w=800',
  'SCHEDULED',
  NOW() + INTERVAL '12 hours', 259200, NOW() + INTERVAL '84 hours',
  false, 'APPROVED',
  NOW(), NOW()
),
(
  'drop-6', 'curator-3', 'Terrain Building Essentials',
  'terrain-building-essentials',
  'Everything you need to start building tabletop terrain. Includes foam, texture materials, paints, and tools.',
  'Terrain Crafting', 'MYSTERY_BOX', 'MINI', 'mini-cat-4',
  59.99, 85.00, 15, 0, 0,
  'https://images.unsplash.com/photo-1611329532992-0b7d0e0b5c82?w=800',
  'SCHEDULED',
  NOW() + INTERVAL '24 hours', 172800, NOW() + INTERVAL '72 hours',
  false, 'APPROVED',
  NOW(), NOW()
);

SELECT 'Test data seeded successfully!' as message;
