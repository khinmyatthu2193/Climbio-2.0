ALTER TABLE "settings"
  ADD COLUMN "watermark_position" VARCHAR(20) NOT NULL DEFAULT 'CENTER',
  ADD COLUMN "watermark_size" VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "watermark_rotation" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "settings"
  ADD CONSTRAINT "settings_watermark_position_check" CHECK ("watermark_position" IN ('TOP_LEFT', 'TOP_CENTER', 'TOP_RIGHT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT')),
  ADD CONSTRAINT "settings_watermark_size_check" CHECK ("watermark_size" IN ('SMALL', 'MEDIUM', 'LARGE')),
  ADD CONSTRAINT "settings_watermark_rotation_check" CHECK ("watermark_rotation" BETWEEN -45 AND 45);
