/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `medicine_details` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `reviews` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);
