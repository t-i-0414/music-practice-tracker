-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('REFRESH', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateTable
CREATE TABLE "user_auth_tokens" (
    "id" SERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "type" "token_type" NOT NULL,
    "user_public_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_tokens_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "apple_id" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "password_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_tokens_public_id_key" ON "user_auth_tokens"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_tokens_token_key" ON "user_auth_tokens"("token");

-- CreateIndex
CREATE INDEX "user_auth_tokens_user_public_id_idx" ON "user_auth_tokens"("user_public_id");

-- CreateIndex
CREATE INDEX "user_auth_tokens_expires_at_idx" ON "user_auth_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "user_auth_tokens_created_at_idx" ON "user_auth_tokens"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "users"("apple_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- AddForeignKey
ALTER TABLE "user_auth_tokens" ADD CONSTRAINT "user_auth_tokens_user_public_id_fkey" FOREIGN KEY ("user_public_id") REFERENCES "users"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;