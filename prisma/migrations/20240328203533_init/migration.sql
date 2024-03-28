/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Anime" ALTER COLUMN "title_english" DROP NOT NULL,
ALTER COLUMN "title_romanji" DROP NOT NULL,
ALTER COLUMN "others" DROP NOT NULL,
ALTER COLUMN "NbEps" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Anime_id_key" ON "Anime"("id");
