-- CreateTable
CREATE TABLE "Anime" (
    "id" INTEGER NOT NULL,
    "titleOriginal" TEXT NOT NULL,
    "titleEnglish" TEXT,
    "titleRomanized" TEXT,
    "titleFrench" TEXT,
    "alternativeTitles" TEXT,
    "mediaType" TEXT NOT NULL,
    "airingStatus" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "genres" TEXT[],
    "coverImageUrl" TEXT NOT NULL,
    "popularityScore" DOUBLE PRECISION NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "startYear" INTEGER NOT NULL,
    "episodesCount" INTEGER,
    "synopsis" TEXT,
    "bannerImageUrl" TEXT,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_id_key" ON "Anime"("id");
