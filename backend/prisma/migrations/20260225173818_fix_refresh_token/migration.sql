-- DropIndex
DROP INDEX `sessoes_refreshToken_key` ON `sessoes`;

-- AlterTable
ALTER TABLE `sessoes` MODIFY `refreshToken` TEXT NOT NULL;
