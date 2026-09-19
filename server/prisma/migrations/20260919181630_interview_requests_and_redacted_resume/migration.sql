-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "redactedResumeText" TEXT;

-- CreateTable
CREATE TABLE "InterviewRequest" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "InterviewRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewRequest" ADD CONSTRAINT "InterviewRequest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
