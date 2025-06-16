/*
  Warnings:

  - You are about to drop the `DeletedUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "DeletedUser";

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
