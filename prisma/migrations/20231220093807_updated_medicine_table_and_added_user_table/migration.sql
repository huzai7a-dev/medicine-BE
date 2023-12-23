/*
  Warnings:

  - The primary key for the `medicine_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `efficacy` on the `medicine_details` table. All the data in the column will be lost.
  - Made the column `is_public` on table `medicine_details` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `medicine_details` DROP PRIMARY KEY,
    DROP COLUMN `efficacy`,
    ADD COLUMN `formula` VARCHAR(191) NULL,
    ADD COLUMN `milligrams` VARCHAR(191) NULL,
    ADD COLUMN `updated_by` VARCHAR(191) NULL,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `is_public` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `created_at` DROP DEFAULT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL,
    `details` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `mobile_no` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NULL,
    `username` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
