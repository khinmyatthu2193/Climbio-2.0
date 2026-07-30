-- Align products with the inventory module's single-image model.
ALTER TABLE "products" ADD COLUMN "image" TEXT;
UPDATE "products" SET "image" = "images"[1] WHERE cardinality("images") > 0;
ALTER TABLE "products" DROP COLUMN "images";
ALTER TABLE "products" DROP COLUMN "is_deleted";
