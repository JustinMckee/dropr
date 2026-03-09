/*
  Warnings:

  - You are about to drop the column `category` on the `Drop` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Drop` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('GENERAL', 'MATERIAL', 'COLOR', 'THEME', 'SKILL_LEVEL');

-- DropIndex
DROP INDEX "Drop_category_idx";

-- AlterTable
ALTER TABLE "Drop" DROP COLUMN "category",
DROP COLUMN "tags",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "collective" "Collective" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "TagType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "collective" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchAnalytics" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "collective" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DropToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DropToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_collective_idx" ON "Category"("collective");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_type_idx" ON "Tag"("type");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_timestamp_idx" ON "SearchHistory"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchAnalytics_query_idx" ON "SearchAnalytics"("query");

-- CreateIndex
CREATE INDEX "SearchAnalytics_timestamp_idx" ON "SearchAnalytics"("timestamp");

-- CreateIndex
CREATE INDEX "_DropToTag_B_index" ON "_DropToTag"("B");

-- CreateIndex
CREATE INDEX "Drop_categoryId_idx" ON "Drop"("categoryId");

-- CreateIndex
CREATE INDEX "Drop_price_idx" ON "Drop"("price");

-- CreateIndex
CREATE INDEX "Drop_title_idx" ON "Drop"("title");

-- CreateIndex
CREATE INDEX "Drop_description_idx" ON "Drop"("description");

-- AddForeignKey
ALTER TABLE "Drop" ADD CONSTRAINT "Drop_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DropToTag" ADD CONSTRAINT "_DropToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DropToTag" ADD CONSTRAINT "_DropToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
