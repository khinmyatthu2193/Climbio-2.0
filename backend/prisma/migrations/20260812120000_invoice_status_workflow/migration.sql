-- Replace the legacy invoice lifecycle while preserving existing records.
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_legacy";

CREATE TYPE "InvoiceStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'PAID',
  'CANCELLED'
);

ALTER TABLE "invoices"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "InvoiceStatus"
  USING (
    CASE "status"::text
      WHEN 'DRAFT' THEN 'PENDING'
      WHEN 'SENT' THEN 'PROCESSING'
      WHEN 'OVERDUE' THEN 'PENDING'
      ELSE "status"::text
    END
  )::"InvoiceStatus",
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "InvoiceStatus_legacy";

CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP');

ALTER TABLE "invoices"
  ADD COLUMN "order_type" "OrderType" NOT NULL DEFAULT 'DELIVERY';
