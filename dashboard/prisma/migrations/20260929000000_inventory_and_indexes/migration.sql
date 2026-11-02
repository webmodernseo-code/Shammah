ALTER TABLE "orders" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "orders" ADD COLUMN "stockRestoredAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "product_variants_productId_size_color_key"
ON "product_variants"("productId", "size", "color");

CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
