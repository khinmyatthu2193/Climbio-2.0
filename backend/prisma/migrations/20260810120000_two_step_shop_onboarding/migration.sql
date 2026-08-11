-- Existing applications keep their submission timestamp. New accounts leave it null
-- until the owner submits the separate shop application.
ALTER TABLE "users" ALTER COLUMN "submitted_at" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "submitted_at" DROP DEFAULT;

ALTER TABLE "users"
  ADD COLUMN "business_category" VARCHAR(100),
  ADD COLUMN "business_description" TEXT,
  ADD COLUMN "business_phone" VARCHAR(30),
  ADD COLUMN "business_email" VARCHAR(255),
  ADD COLUMN "city_township" VARCHAR(100),
  ADD COLUMN "owner_role" VARCHAR(100),
  ADD COLUMN "business_registration_number" VARCHAR(100),
  ADD COLUMN "verification_document" TEXT,
  ADD COLUMN "website_url" VARCHAR(500);

CREATE INDEX "users_role_submitted_at_approval_status_idx"
  ON "users" ("role", "submitted_at", "approval_status");
