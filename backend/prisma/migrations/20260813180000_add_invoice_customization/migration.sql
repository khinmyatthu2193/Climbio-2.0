ALTER TABLE "settings"
  ADD COLUMN "invoice_theme_color" VARCHAR(7) NOT NULL DEFAULT '#7c3aed',
  ADD COLUMN "watermark_type" VARCHAR(20) NOT NULL DEFAULT 'NONE',
  ADD COLUMN "watermark_image_url" TEXT,
  ADD COLUMN "watermark_emoji" VARCHAR(20),
  ADD COLUMN "watermark_opacity" INTEGER NOT NULL DEFAULT 10;

ALTER TABLE "settings"
  ADD CONSTRAINT "settings_watermark_opacity_check" CHECK ("watermark_opacity" BETWEEN 0 AND 30),
  ADD CONSTRAINT "settings_watermark_type_check" CHECK ("watermark_type" IN ('NONE', 'LOGO', 'EMOJI', 'IMAGE'));
