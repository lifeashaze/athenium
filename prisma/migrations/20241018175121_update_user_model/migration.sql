/*
  Warnings:

  - You are about to drop the column `adminId` on the `Classroom` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedBy` on the `Resource` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[srn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploaderId` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'PROFESSOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_adminId_fkey";

-- AlterTable
ALTER TABLE "Classroom" DROP COLUMN "adminId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "uploadedBy",
ADD COLUMN     "uploaderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "officeHours" TEXT,
ADD COLUMN     "prn" TEXT,
ADD COLUMN     "rollNo" TEXT,
ADD COLUMN     "srn" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "year" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- CreateIndex
CREATE UNIQUE INDEX "User_srn_key" ON "User"("srn");

-- CreateIndex
CREATE UNIQUE INDEX "User_prn_key" ON "User"("prn");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
