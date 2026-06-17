-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('ANY', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterEnum
ALTER TYPE "ParticipantStatus" ADD VALUE 'WAITLISTED';

-- AlterTable
ALTER TABLE "open_runs" ADD COLUMN     "skillLevel" "SkillLevel" NOT NULL DEFAULT 'ANY';
