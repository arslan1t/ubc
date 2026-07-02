-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SUBMISSION_CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "instagramUsername" TEXT;
