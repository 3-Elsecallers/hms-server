/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "expiresAt" SET DEFAULT extract(epoch from now() + interval '10 minutes');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "VerificationCode" ALTER COLUMN "expiresAt" SET DEFAULT extract(epoch from now() + interval '5 minutes');

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
