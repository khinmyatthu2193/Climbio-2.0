CREATE TYPE "PromptStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "prompt_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "icon" VARCHAR(20),
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "prompt_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_prompts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(160) NOT NULL,
  "category_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "ai_tool" VARCHAR(100) NOT NULL,
  "example_image_url" VARCHAR(1000),
  "status" "PromptStatus" NOT NULL DEFAULT 'DRAFT',
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prompt_categories_name_key" ON "prompt_categories"("name");
CREATE INDEX "prompt_categories_is_active_name_idx" ON "prompt_categories"("is_active", "name");
CREATE INDEX "ai_prompts_status_category_id_created_at_idx" ON "ai_prompts"("status", "category_id", "created_at");
CREATE INDEX "ai_prompts_ai_tool_status_idx" ON "ai_prompts"("ai_tool", "status");
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "prompt_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "prompt_categories" ("name", "icon", "description") VALUES
  ('Fashion', '👗', 'Clothing advertisements, product photoshoots, and collection promotions'),
  ('Food & Beverage', '🍔', 'Restaurant, menu, and food photography ideas'),
  ('Beauty', '💄', 'Cosmetic advertisements, salon promotions, and product showcases'),
  ('Gift & Lifestyle', '🎁', 'Gift promotions and seasonal campaigns'),
  ('Electronics', '📱', 'Product showcases and technology advertisements'),
  ('General Business', '🛒', 'Captions, promotions, and customer engagement ideas');
