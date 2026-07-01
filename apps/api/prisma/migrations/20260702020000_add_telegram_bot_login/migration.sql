-- CreateEnum
CREATE TYPE "TelegramLoginStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED');

-- CreateTable
CREATE TABLE "telegram_login_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "TelegramLoginStatus" NOT NULL DEFAULT 'PENDING',
    "chatId" TEXT,
    "telegramId" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "photoUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_login_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_login_sessions_token_key" ON "telegram_login_sessions"("token");

-- CreateIndex
CREATE INDEX "telegram_login_sessions_chatId_idx" ON "telegram_login_sessions"("chatId");

-- CreateIndex
CREATE INDEX "telegram_login_sessions_expiresAt_idx" ON "telegram_login_sessions"("expiresAt");
