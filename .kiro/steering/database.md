---
inclusion: fileMatch
fileMatchPattern: 'prisma/**/*'
---
# Database Guidelines

## Philosophy

Design for clarity and performance. Use Prisma for type-safe database access, follow consistent naming conventions, and index frequently queried fields. Select only what you need, avoid N+1 queries, and always paginate large result sets. Migrations should be backward compatible and tested on staging first.

## Database Checklist

**Schema Design:**
- [ ] PascalCase for models, camelCase for fields
- [ ] cuid() for user-facing IDs
- [ ] createdAt and updatedAt on all models
- [ ] Soft deletes (deletedAt) for important records
- [ ] Indexes on foreign keys and frequently queried fields
- [ ] Unique constraints where appropriate
- [ ] Database-level constraints (non-negative, etc.)

**Query Optimization:**
- [ ] Select only needed fields
- [ ] Use include for related data (avoid N+1)
- [ ] Pagination for large result sets
- [ ] Indexes on WHERE and ORDER BY fields
- [ ] Connection pooling configured

**Migrations:**
- [ ] Test migrations on staging first
- [ ] Backup before production migrations
- [ ] Backward compatible when possible
- [ ] Never edit applied migrations
- [ ] Seed data for development

**Security:**
- [ ] Parameterized queries (Prisma handles this)
- [ ] Row-level authorization in Server Actions
- [ ] Never trust client-provided IDs
- [ ] Verify permissions before mutations

## ORM and Database

- Use Prisma as the ORM
- PostgreSQL as the database
- Prisma Client for type-safe database access
- Prisma Migrate for schema migrations
- Provide seed data for development

## Schema Design Principles

### Naming Conventions

```prisma
// Tables: PascalCase singular
model Drop {}
model Curator {}
model User {}

// Fields: camelCase
model Drop {
  id          String
  createdAt   DateTime
  startTime   DateTime
  endTime     DateTime
  isActive    Boolean
}

// Relations: descriptive names
model Drop {
  curator   Curator @relation(fields: [curatorId], references: [id])
  curatorId String
  items     DropItem[]
}

// Enums: PascalCase
enum DropStatus {
  UPCOMING
  LIVE
  ENDED
  CANCELLED
}
```

### Primary Keys
- Use `cuid()` for user-facing IDs (drops, curators, orders)
- Use `uuid()` for internal records
- Always use `String` type for IDs (not Int)

```prisma
model Drop {
  id String @id @default(cuid())
}
```

### Timestamps
- Always include `createdAt` and `updatedAt`
- Use `@default(now())` and `@updatedAt`

```prisma
model Drop {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Soft Deletes
- Use `deletedAt` for soft deletes on important records
- Never hard delete user data, orders, or financial records

```prisma
model Drop {
  id        String    @id @default(cuid())
  deletedAt DateTime?
}
```

## Relationships

### One-to-Many
```prisma
model Curator {
  id    String @id @default(cuid())
  drops Drop[]
}

model Drop {
  id        String  @id @default(cuid())
  curator   Curator @relation(fields: [curatorId], references: [id])
  curatorId String
}
```

### Many-to-Many
```prisma
// Explicit join table for additional fields
model Drop {
  id    String     @id @default(cuid())
  items DropItem[]
}

model Product {
  id        String     @id @default(cuid())
  dropItems DropItem[]
}

model DropItem {
  id        String  @id @default(cuid())
  drop      Drop    @relation(fields: [dropId], references: [id])
  dropId    String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  
  @@unique([dropId, productId])
}
```

## Indexing

### When to Add Indexes
- Foreign keys (Prisma adds these automatically)
- Fields used in WHERE clauses frequently
- Fields used in ORDER BY
- Unique constraints

```prisma
model Drop {
  id        String      @id @default(cuid())
  curatorId String
  status    DropStatus
  startTime DateTime
  
  curator Curator @relation(fields: [curatorId], references: [id])
  
  @@index([curatorId])
  @@index([status])
  @@index([startTime])
  @@index([status, startTime]) // Composite index for common queries
}
```

### Unique Constraints
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
}

model Curator {
  id   String @id @default(cuid())
  slug String @unique
}
```

## Data Validation

### Database-Level Constraints
```prisma
model Drop {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(200)
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  inventory   Int      @default(0)
  
  @@check(inventory >= 0, name: "inventory_non_negative")
  @@check(price >= 0, name: "price_non_negative")
}
```

### Application-Level Validation
- Use Zod schemas for input validation before database operations
- Validate in Server Actions before calling Prisma

```typescript
import { z } from 'zod';

const createDropSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  inventory: z.number().int().nonnegative(),
});

export async function createDrop(input: unknown) {
  const data = createDropSchema.parse(input);
  return await db.drop.create({ data });
}
```

## Query Patterns

### Select Only What You Need
```typescript
// ❌ Avoid: Fetching all fields
const drops = await db.drop.findMany();

// ✅ Good: Select specific fields
const drops = await db.drop.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    curator: {
      select: {
        id: true,
        name: true,
      }
    }
  }
});
```

### Use Pagination
```typescript
// Always paginate large result sets
const drops = await db.drop.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' },
});
```

### Avoid N+1 Queries
```typescript
// ❌ Avoid: N+1 query
const drops = await db.drop.findMany();
for (const drop of drops) {
  const curator = await db.curator.findUnique({ where: { id: drop.curatorId } });
}

// ✅ Good: Use include
const drops = await db.drop.findMany({
  include: {
    curator: true,
  }
});
```

## Transactions

### Use Transactions for Related Operations
```typescript
// Ensure atomicity for related operations
await db.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: {
      userId,
      total,
    }
  });
  
  await tx.drop.update({
    where: { id: dropId },
    data: {
      inventory: { decrement: quantity }
    }
  });
  
  return order;
});
```

### Interactive Transactions for Complex Logic
```typescript
await db.$transaction(async (tx) => {
  const drop = await tx.drop.findUnique({ where: { id: dropId } });
  
  if (!drop || drop.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  
  await tx.drop.update({
    where: { id: dropId },
    data: { inventory: { decrement: quantity } }
  });
  
  await tx.order.create({ data: orderData });
});
```

## Migrations

### Migration Workflow
```bash
# Create migration
npx prisma migrate dev --name add_drop_status

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Migration Best Practices
- Always review generated SQL before applying
- Test migrations on staging before production
- Make migrations backward compatible when possible
- Use multiple migrations for complex schema changes
- Never edit applied migrations

### Seed Data

Create seed data for development and testing:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const curator = await prisma.user.upsert({
    where: { email: 'curator@example.com' },
    update: {},
    create: {
      email: 'curator@example.com',
      name: 'Test Curator',
      role: 'CURATOR',
    },
  });

  // Create test drops
  await prisma.drop.create({
    data: {
      title: 'Mechanical Keyboard Mystery Box',
      description: 'Curated selection of switches and keycaps',
      price: 49.99,
      inventory: 50,
      status: 'UPCOMING',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      curatorId: curator.id,
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Data Migrations
```typescript
// For data transformations, create a separate script
// scripts/migrate-drop-status.ts
import { db } from '@/lib/db';

async function migrateDropStatus() {
  await db.drop.updateMany({
    where: { status: null },
    data: { status: 'UPCOMING' }
  });
}

migrateDropStatus();
```

## Performance

### Connection Pooling
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### Query Optimization
- Use `findUnique` instead of `findFirst` when possible
- Use `count` for counting instead of fetching all records
- Use database-level aggregations
- Consider caching frequently accessed data

## Security

### Prevent SQL Injection
- Prisma automatically prevents SQL injection
- Never use raw SQL unless absolutely necessary
- If using `$queryRaw`, always use parameterized queries

```typescript
// ✅ Good: Parameterized query
const drops = await db.$queryRaw`
  SELECT * FROM Drop WHERE curatorId = ${curatorId}
`;

// ❌ Avoid: String interpolation
const drops = await db.$queryRaw`
  SELECT * FROM Drop WHERE curatorId = '${curatorId}'
`;
```

### Row-Level Security
- Implement authorization checks in Server Actions
- Never trust client-provided IDs without verification
- Always verify user permissions before database operations

```typescript
'use server'

export async function updateDrop(dropId: string, data: UpdateDropInput) {
  const session = await getSession();
  
  // Verify ownership
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    select: { curatorId: true }
  });
  
  if (drop?.curatorId !== session.user.id) {
    throw new UnauthorizedError();
  }
  
  return await db.drop.update({
    where: { id: dropId },
    data,
  });
}
```
