CREATE TYPE "public"."user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'BANNED');

CREATE TABLE
  "users" (
    "id" SERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid (),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."user_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  );

CREATE UNIQUE INDEX "users_public_id_key" ON "users" ("public_id");
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE INDEX "users_name_idx" ON "users" ("name");
CREATE INDEX "users_status_idx" ON "users" ("status");
CREATE INDEX "users_created_at_idx" ON "users" ("created_at");
