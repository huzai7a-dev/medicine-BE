-- CreateTable
CREATE TABLE `MedicineDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reg_no` VARCHAR(191) NULL,
    `brand_name` VARCHAR(191) NULL,
    `company_name` VARCHAR(191) NULL,
    `formulation` VARCHAR(191) NULL,
    `dosage_form` VARCHAR(191) NULL,
    `pack_size` VARCHAR(191) NULL,
    `mrp` DECIMAL(65, 30) NULL,
    `remarks` VARCHAR(191) NULL,
    `efficacy` VARCHAR(191) NULL,
    `is_public` BOOLEAN NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
