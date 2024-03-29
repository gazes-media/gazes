/*
  Warnings:

  - You are about to drop the column `Genres` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `NbEps` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `Popularity` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `Score` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `StartDateYear` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `Type` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `Url` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `UrlImage` on the `Anime` table. All the data in the column will be lost.
  - Added the required column `popularity` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date_year` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_image` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "Genres",
DROP COLUMN "NbEps",
DROP COLUMN "Popularity",
DROP COLUMN "Score",
DROP COLUMN "StartDateYear",
DROP COLUMN "Status",
DROP COLUMN "Type",
DROP COLUMN "Url",
DROP COLUMN "UrlImage",
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "nb_eps" INTEGER,
ADD COLUMN     "popularity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "score" TEXT NOT NULL,
ADD COLUMN     "start_date_year" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "url_image" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "episode" TEXT NOT NULL,
    "num" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "url_image" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episode_url_key" ON "Episode"("url");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
