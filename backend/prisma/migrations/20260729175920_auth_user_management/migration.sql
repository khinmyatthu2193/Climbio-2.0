-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'STAFF');

-- Add the nullable timestamp first so existing users can be preserved.
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "updated_at" TIMESTAMP(3);

UPDATE "users" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;
