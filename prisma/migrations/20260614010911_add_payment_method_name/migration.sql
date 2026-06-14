/*
  Warnings:

  - Added the required column `name` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'KITCHEN';

-- DropIndex
DROP INDEX "payment_methods_type_key";

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "height" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "shape" TEXT NOT NULL DEFAULT 'SQUARE',
ADD COLUMN     "width" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "x" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "y" INTEGER NOT NULL DEFAULT 100;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
