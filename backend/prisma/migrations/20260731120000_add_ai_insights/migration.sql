CREATE TYPE "AIInsightType" AS ENUM ('DAILY_REPORT', 'SALES_ANALYSIS', 'INVENTORY_ALERT');

CREATE TABLE "ai_insights" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "type" "AIInsightType" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_insights_shop_id_type_created_at_idx" ON "ai_insights"("shop_id", "type", "created_at");

ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_shop_id_fkey"
FOREIGN KEY ("shop_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
