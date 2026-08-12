-- Extend invoice workflows for pickup orders and persist their fulfillment type.
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'PICKED_UP';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderType') THEN
    CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP');
  END IF;
END
$$;

ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS "order_type" "OrderType" NOT NULL DEFAULT 'DELIVERY';
