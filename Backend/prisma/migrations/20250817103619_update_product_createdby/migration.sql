/*
  Warnings:

  - A unique constraint covering the columns `[name,stallId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Product_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_stallId_key" ON "public"."Product"("name", "stallId");
