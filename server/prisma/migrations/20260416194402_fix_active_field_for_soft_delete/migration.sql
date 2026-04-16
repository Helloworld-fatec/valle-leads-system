-- AlterTable
ALTER TABLE "Stores" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT true;
