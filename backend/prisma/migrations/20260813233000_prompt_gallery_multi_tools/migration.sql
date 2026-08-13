ALTER TABLE "ai_prompts" ADD COLUMN "ai_tools" TEXT[];
UPDATE "ai_prompts" SET "ai_tools" = ARRAY["ai_tool"] WHERE "ai_tools" IS NULL;
ALTER TABLE "ai_prompts" ALTER COLUMN "ai_tools" SET NOT NULL;
DROP INDEX "ai_prompts_ai_tool_status_idx";
ALTER TABLE "ai_prompts" DROP COLUMN "ai_tool", DROP COLUMN "description";

INSERT INTO "prompt_categories" ("name", "icon", "description")
VALUES ('Other', '✨', 'Prompts that do not fit another category')
ON CONFLICT ("name") DO NOTHING;
