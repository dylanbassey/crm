/*
  Warnings:

  - You are about to drop the column `UpdatedAt` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `stage` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('STANDARD', 'PREMIUM', 'VIP');

-- CreateEnum
CREATE TYPE "LifecycleStage" AS ENUM ('LEAD', 'PROSPECT', 'ACTIVE', 'DORMANT');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "UpdatedAt",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "stage" "LifecycleStage" NOT NULL,
ADD COLUMN     "tier" "CustomerTier" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
