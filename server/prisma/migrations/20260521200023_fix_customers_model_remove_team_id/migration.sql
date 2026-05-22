/*
  Warnings:

  - You are about to drop the column `team_id` on the `customers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_team_id_fkey";

-- DropIndex
DROP INDEX "customers_team_id_idx";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "team_id";
