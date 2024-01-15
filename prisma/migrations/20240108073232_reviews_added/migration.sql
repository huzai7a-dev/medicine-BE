/*
  Warnings:

  - You are about to alter the column `mrp` on the `medicine_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,2)`.
  - You are about to alter the column `is_public` on the `medicine_details` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Bit(1)`.
  - You are about to alter the column `is_public` on the `user` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Bit(1)`.

*/
-- DropIndex
DROP INDEX `user_username_key` ON `user`;

-- AlterTable
ALTER TABLE `medicine_details` MODIFY `formulation` TEXT NULL,
    MODIFY `mrp` DECIMAL(19, 2) NULL,
    MODIFY `remarks` VARCHAR(255) NULL,
    MODIFY `is_public` BIT(1) NOT NULL DEFAULT false,
    MODIFY `created_at` DATETIME(6) NULL,
    MODIFY `updated_at` DATETIME(6) NULL,
    MODIFY `formula` VARCHAR(255) NULL,
    MODIFY `milligrams` VARCHAR(255) NULL,
    MODIFY `efficacy` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `address` VARCHAR(255) NULL,
    MODIFY `created_at` DATETIME(6) NULL,
    MODIFY `details` VARCHAR(255) NULL,
    MODIFY `is_public` BIT(1) NOT NULL DEFAULT false,
    MODIFY `mobile_no` VARCHAR(255) NULL,
    MODIFY `name` VARCHAR(255) NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `type` VARCHAR(255) NULL,
    MODIFY `updated_at` DATETIME(6) NULL,
    MODIFY `username` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `reg_no` VARCHAR(255) NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `is_public` BIT(1) NOT NULL DEFAULT false,
    `rating` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
