CREATE TABLE "shop_slug_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shop_slug_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shop_slug_history_slug_key" ON "shop_slug_history"("slug");
CREATE INDEX "shop_slug_history_shop_id_idx" ON "shop_slug_history"("shop_id");
ALTER TABLE "shop_slug_history" ADD CONSTRAINT "shop_slug_history_shop_id_fkey"
  FOREIGN KEY ("shop_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
