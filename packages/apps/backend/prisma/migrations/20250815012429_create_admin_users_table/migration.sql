-- CreateEnum
CREATE TYPE "public"."admin_role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."admin_status" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED');

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" SERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid (),
    "cognito_sub" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."admin_role" NOT NULL DEFAULT 'VIEWER',
    "status" "public"."admin_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_public_id_key" ON "public"."admin_users"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_cognito_sub_key" ON "public"."admin_users"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_name_key" ON "public"."admin_users"("name");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "public"."admin_users"("role");

-- CreateIndex
CREATE INDEX "admin_users_status_idx" ON "public"."admin_users"("status");

-- CreateIndex
CREATE INDEX "admin_users_created_at_idx" ON "public"."admin_users"("created_at");
