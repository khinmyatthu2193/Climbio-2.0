-- Preserve legacy JSON invoice lines while new invoices use relational snapshots.
-- The default lets new Prisma writes omit the legacy column safely.
ALTER TABLE "invoices"
  ALTER COLUMN "items" DROP NOT NULL,
  ALTER COLUMN "items" SET DEFAULT '[]'::jsonb;

CREATE TABLE "invoice_items" (
  "id" UUID NOT NULL,
  "invoice_id" UUID NOT NULL,
  "product_id" UUID,
  "product_name" VARCHAR(100) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(14,2) NOT NULL,
  CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "invoices_user_id_status_created_at_idx"
  ON "invoices"("user_id", "status", "created_at");
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");
CREATE INDEX "invoice_items_product_id_idx" ON "invoice_items"("product_id");

ALTER TABLE "invoice_items"
  ADD CONSTRAINT "invoice_items_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoice_items"
  ADD CONSTRAINT "invoice_items_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
