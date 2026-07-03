-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GiveawayStatus" AS ENUM ('OPEN', 'COMPLETED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_REGISTRATION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_REGISTRATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'GIVEAWAY_ENTRY_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'GIVEAWAY_ENTRY_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'GIVEAWAY_WON';

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "height" INTEGER,
ADD COLUMN "weight" INTEGER,
ADD COLUMN "age" INTEGER,
ADD COLUMN "highlightUrl" TEXT,
ADD COLUMN "instagram" TEXT,
ADD COLUMN "reviewNote" TEXT;

-- Existing registrations predate the review flow — keep those players enrolled.
UPDATE "event_registrations" SET "status" = 'APPROVED';

-- CreateIndex
CREATE INDEX "event_registrations_eventId_status_idx" ON "event_registrations"("eventId", "status");

-- CreateTable
CREATE TABLE "event_matches" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "score1" INTEGER,
    "score2" INTEGER,
    "winnerId" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "conditions" TEXT,
    "prize" TEXT NOT NULL,
    "coverUrl" TEXT,
    "status" "GiveawayStatus" NOT NULL DEFAULT 'OPEN',
    "winnerId" TEXT,
    "drawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaway_entries" (
    "id" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_matches_eventId_round_slot_key" ON "event_matches"("eventId", "round", "slot");

-- CreateIndex
CREATE INDEX "event_matches_eventId_idx" ON "event_matches"("eventId");

-- CreateIndex
CREATE INDEX "giveaways_status_idx" ON "giveaways"("status");

-- CreateIndex
CREATE UNIQUE INDEX "giveaway_entries_giveawayId_userId_key" ON "giveaway_entries"("giveawayId", "userId");

-- CreateIndex
CREATE INDEX "giveaway_entries_giveawayId_idx" ON "giveaway_entries"("giveawayId");

-- CreateIndex
CREATE INDEX "giveaway_entries_giveawayId_status_idx" ON "giveaway_entries"("giveawayId", "status");

-- AddForeignKey
ALTER TABLE "event_matches" ADD CONSTRAINT "event_matches_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_matches" ADD CONSTRAINT "event_matches_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_matches" ADD CONSTRAINT "event_matches_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
