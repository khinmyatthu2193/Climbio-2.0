-- This migration preserves every existing tenant record. Administrator role synchronization
-- is deliberately performed by `npm run admin:bootstrap`, which safely reads ADMIN_EMAILS.
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');
CREATE TYPE "ShopApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'DECLINED', 'SUSPENDED');
CREATE TYPE "ShopReviewAction" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'DECLINED', 'SUSPENDED', 'REACTIVATED', 'GENERAL_FEEDBACK', 'RESUBMITTED', 'REOPENED');

ALTER TABLE "users"
  ADD COLUMN "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "approval_status" "ShopApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "approved_at" TIMESTAMP(3),
  ADD COLUMN "suspended_at" TIMESTAMP(3),
  ADD COLUMN "application_version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SHOP_OWNER';
ALTER TABLE "users" ALTER COLUMN "approval_status" SET DEFAULT 'PENDING';

CREATE TABLE "shop_reviews" (
  "id" UUID NOT NULL,
  "shop_id" UUID NOT NULL,
  "admin_id" UUID,
  "action" "ShopReviewAction" NOT NULL,
  "previous_status" "ShopApprovalStatus",
  "next_status" "ShopApprovalStatus",
  "feedback" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shop_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shop_reviews_shop_id_created_at_idx" ON "shop_reviews"("shop_id", "created_at");
CREATE INDEX "shop_reviews_admin_id_created_at_idx" ON "shop_reviews"("admin_id", "created_at");
CREATE INDEX "shop_reviews_action_created_at_idx" ON "shop_reviews"("action", "created_at");
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
