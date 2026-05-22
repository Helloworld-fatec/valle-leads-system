/*
  Warnings:

  - You are about to drop the column `vehicle_interest` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `new_status` on the `negotiation_stage_history` table. All the data in the column will be lost.
  - You are about to drop the column `old_status` on the `negotiation_stage_history` table. All the data in the column will be lost.
  - You are about to drop the `Stores` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lead_id` to the `negotiation_importance_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_id` to the `negotiation_stage_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_stage` to the `negotiation_stage_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_id` to the `negotiation_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `negotiations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_store_id_fkey";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "address_city" TEXT,
ADD COLUMN     "address_complement" TEXT,
ADD COLUMN     "address_neighborhood" TEXT,
ADD COLUMN     "address_number" TEXT,
ADD COLUMN     "address_state" TEXT,
ADD COLUMN     "address_street" TEXT,
ADD COLUMN     "address_zip" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "vehicle_interest",
ADD COLUMN     "interest_item_id" TEXT,
ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "negotiation_importance_history" ADD COLUMN     "lead_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "negotiation_stage_history" DROP COLUMN "new_status",
DROP COLUMN "old_status",
ADD COLUMN     "lead_id" TEXT NOT NULL,
ADD COLUMN     "new_stage" TEXT NOT NULL,
ADD COLUMN     "old_stage" TEXT;

-- AlterTable
ALTER TABLE "negotiation_status_history" ADD COLUMN     "lead_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "negotiations" ADD COLUMN     "attendant_id" TEXT,
ADD COLUMN     "customer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_teams" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Stores";

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_items" (
    "id" TEXT NOT NULL,
    "reference_code" TEXT,
    "description" TEXT NOT NULL,
    "value" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,

    CONSTRAINT "interest_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interest_items_reference_code_key" ON "interest_items"("reference_code");

-- CreateIndex
CREATE INDEX "interest_items_reference_code_idx" ON "interest_items"("reference_code");

-- CreateIndex
CREATE INDEX "interest_items_created_at_idx" ON "interest_items"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_team_id_idx" ON "customers"("team_id");

-- CreateIndex
CREATE INDEX "leads_interest_item_id_idx" ON "leads"("interest_item_id");

-- CreateIndex
CREATE INDEX "negotiation_importance_history_lead_id_idx" ON "negotiation_importance_history"("lead_id");

-- CreateIndex
CREATE INDEX "negotiation_stage_history_lead_id_idx" ON "negotiation_stage_history"("lead_id");

-- CreateIndex
CREATE INDEX "negotiation_status_history_lead_id_idx" ON "negotiation_status_history"("lead_id");

-- CreateIndex
CREATE INDEX "negotiations_customer_id_idx" ON "negotiations"("customer_id");

-- CreateIndex
CREATE INDEX "negotiations_attendant_id_idx" ON "negotiations"("attendant_id");

-- CreateIndex
CREATE INDEX "system_logs_module_idx" ON "system_logs"("module");

-- CreateIndex
CREATE INDEX "teams_store_id_idx" ON "teams"("store_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_interest_item_id_fkey" FOREIGN KEY ("interest_item_id") REFERENCES "interest_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_attendant_id_fkey" FOREIGN KEY ("attendant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_status_history" ADD CONSTRAINT "negotiation_status_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_stage_history" ADD CONSTRAINT "negotiation_stage_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_importance_history" ADD CONSTRAINT "negotiation_importance_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
