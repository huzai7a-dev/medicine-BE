-- AlterTable
ALTER TABLE `medicine_details` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `reviews` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` MODIFY `is_public` BIT(1) NOT NULL DEFAULT false;
