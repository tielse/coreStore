-- CreateTable
CREATE TABLE "sys_user" (
    "id" TEXT NOT NULL,
    "keycloak_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_user_group" (
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_user_group_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "cm_car_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_car_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_car_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_car_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_car" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_car_detail" (
    "car_id" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_car_detail_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "cm_car_image" (
    "id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "s3_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_car_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_price" (
    "id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_bike_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_bike_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_bike" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_bike_detail" (
    "bike_id" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_detail_pkey" PRIMARY KEY ("bike_id")
);

-- CreateTable
CREATE TABLE "cm_bike_image" (
    "id" TEXT NOT NULL,
    "bike_id" TEXT NOT NULL,
    "s3_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_bike_price" (
    "id" TEXT NOT NULL,
    "bike_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_bike_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_moto_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_moto_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_moto" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_moto_detail" (
    "moto_id" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_detail_pkey" PRIMARY KEY ("moto_id")
);

-- CreateTable
CREATE TABLE "cm_moto_image" (
    "id" TEXT NOT NULL,
    "moto_id" TEXT NOT NULL,
    "s3_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_moto_price" (
    "id" TEXT NOT NULL,
    "moto_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_moto_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_shipping_method" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_fee" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_shipping_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_order" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "total_amount" DECIMAL(65,30) NOT NULL,
    "service_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_order_item" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_order_service" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_order_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_shipping" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "shipping_method_id" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ord_return" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "refund_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ord_return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_review" (
    "id" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cm_inventory" (
    "id" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity_total" INTEGER NOT NULL,
    "quantity_reserved" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,
    "location" TEXT,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cm_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_event_log" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sys_event_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_keycloak_user_id_key" ON "sys_user"("keycloak_user_id");

-- CreateIndex
CREATE INDEX "cm_car_model_brand_id_idx" ON "cm_car_model"("brand_id");

-- CreateIndex
CREATE INDEX "cm_car_model_id_idx" ON "cm_car"("model_id");

-- CreateIndex
CREATE INDEX "cm_bike_model_brand_id_idx" ON "cm_bike_model"("brand_id");

-- CreateIndex
CREATE INDEX "cm_bike_model_id_idx" ON "cm_bike"("model_id");

-- CreateIndex
CREATE INDEX "cm_moto_model_brand_id_idx" ON "cm_moto_model"("brand_id");

-- CreateIndex
CREATE INDEX "cm_moto_model_id_idx" ON "cm_moto"("model_id");

-- CreateIndex
CREATE INDEX "ord_order_customer_id_idx" ON "ord_order"("customer_id");

-- CreateIndex
CREATE INDEX "ord_shipping_order_id_idx" ON "ord_shipping"("order_id");

-- CreateIndex
CREATE INDEX "ord_shipping_shipping_method_id_idx" ON "ord_shipping"("shipping_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "ord_payment_order_id_key" ON "ord_payment"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "cm_inventory_product_type_product_id_key" ON "cm_inventory"("product_type", "product_id");

-- AddForeignKey
ALTER TABLE "sys_user_group" ADD CONSTRAINT "sys_user_group_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "sys_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_user_group" ADD CONSTRAINT "sys_user_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "sys_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_car_model" ADD CONSTRAINT "cm_car_model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "cm_car_brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_car" ADD CONSTRAINT "cm_car_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "cm_car_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_car_detail" ADD CONSTRAINT "cm_car_detail_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cm_car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_car_image" ADD CONSTRAINT "cm_car_image_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cm_car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_price" ADD CONSTRAINT "cm_price_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cm_car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_bike_model" ADD CONSTRAINT "cm_bike_model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "cm_bike_brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_bike" ADD CONSTRAINT "cm_bike_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "cm_bike_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_bike_detail" ADD CONSTRAINT "cm_bike_detail_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "cm_bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_bike_image" ADD CONSTRAINT "cm_bike_image_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "cm_bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_bike_price" ADD CONSTRAINT "cm_bike_price_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "cm_bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_moto_model" ADD CONSTRAINT "cm_moto_model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "cm_moto_brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_moto" ADD CONSTRAINT "cm_moto_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "cm_moto_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_moto_detail" ADD CONSTRAINT "cm_moto_detail_moto_id_fkey" FOREIGN KEY ("moto_id") REFERENCES "cm_moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_moto_image" ADD CONSTRAINT "cm_moto_image_moto_id_fkey" FOREIGN KEY ("moto_id") REFERENCES "cm_moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cm_moto_price" ADD CONSTRAINT "cm_moto_price_moto_id_fkey" FOREIGN KEY ("moto_id") REFERENCES "cm_moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_order" ADD CONSTRAINT "ord_order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "ord_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_order_item" ADD CONSTRAINT "ord_order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ord_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_order_item" ADD CONSTRAINT "ord_order_item_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cm_car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_order_service" ADD CONSTRAINT "ord_order_service_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ord_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_order_service" ADD CONSTRAINT "ord_order_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "cm_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_shipping" ADD CONSTRAINT "ord_shipping_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ord_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_shipping" ADD CONSTRAINT "ord_shipping_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "cm_shipping_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_payment" ADD CONSTRAINT "ord_payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ord_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ord_return" ADD CONSTRAINT "ord_return_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ord_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
