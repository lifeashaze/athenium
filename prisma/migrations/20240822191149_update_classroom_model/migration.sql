/*
  Warnings:

  - Added the required column `courseCode` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseName` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `division` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN     "courseCode" TEXT NOT NULL,
ADD COLUMN     "courseName" TEXT NOT NULL,
ADD COLUMN     "division" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL;
