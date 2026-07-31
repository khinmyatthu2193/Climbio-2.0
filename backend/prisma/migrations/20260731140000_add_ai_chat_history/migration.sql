CREATE TABLE "ai_chat_history" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_chat_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_chat_history_shop_id_created_at_idx" ON "ai_chat_history"("shop_id", "created_at");

ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_shop_id_fkey"
FOREIGN KEY ("shop_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
