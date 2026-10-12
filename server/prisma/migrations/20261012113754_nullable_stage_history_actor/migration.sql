-- DropForeignKey
ALTER TABLE "StageHistory" DROP CONSTRAINT "StageHistory_changedById_fkey";

-- AlterTable
ALTER TABLE "StageHistory" ALTER COLUMN "changedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
