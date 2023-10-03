/*
  Warnings:

  - Added the required column `time` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
