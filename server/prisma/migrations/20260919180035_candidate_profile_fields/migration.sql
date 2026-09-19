-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "resumeAchievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "resumeParsedAt" TIMESTAMP(3),
ADD COLUMN     "resumeSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "resumeSummary" TEXT,
ADD COLUMN     "videoIntroUrl" TEXT,
ADD COLUMN     "whatsapp" TEXT;
