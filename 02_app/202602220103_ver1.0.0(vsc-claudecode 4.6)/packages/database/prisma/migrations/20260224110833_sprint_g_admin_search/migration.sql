-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "brandFont" TEXT,
ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socialLinks" JSONB NOT NULL DEFAULT '{}';
