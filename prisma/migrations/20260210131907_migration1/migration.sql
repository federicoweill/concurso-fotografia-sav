/*
  Warnings:

  - You are about to drop the column `judgeId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,photoId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_judgeId_fkey";

-- DropIndex
DROP INDEX "votes_judgeId_photoId_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dni" TEXT;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "judgeId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "password_reset_tokens";

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_photoId_key" ON "votes"("userId", "photoId");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
