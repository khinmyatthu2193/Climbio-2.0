-- Supports owner-scoped low-stock counts and stock ordering.
CREATE INDEX "products_user_id_quantity_idx" ON "products"("user_id", "quantity");
