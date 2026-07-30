ALTER TABLE "users" ADD COLUMN "slug" VARCHAR(120);

UPDATE "users"
SET "slug" =
  COALESCE(
    NULLIF(
      trim(BOTH '-' FROM lower(regexp_replace("shop_name", '[^a-zA-Z0-9]+', '-', 'g'))),
      ''
    ),
    'shop'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 6);

ALTER TABLE "users"
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "slug" SET DEFAULT
    ('shop-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

ALTER TABLE "products"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "products_user_id_is_active_category_id_idx"
  ON "products"("user_id", "is_active", "category_id");
