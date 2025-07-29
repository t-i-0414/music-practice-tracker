-- CreateTable
CREATE TABLE
  "users" (
    "id" SERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid (),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "suspended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users" ("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users" ("name");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users" ("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users" ("deleted_at");

-- CreateIndex
CREATE INDEX "users_suspended_at_idx" ON "users" ("suspended_at");
