/*
  Warnings:

  - A unique constraint covering the columns `[profileSlug]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "profileSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_profileSlug_key" ON "profiles"("profileSlug");
