-- CreateTable
CREATE TABLE "Anime" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleEnglish" TEXT,
    "titleRomanji" TEXT,
    "titleFrench" TEXT,
    "others" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "url" TEXT NOT NULL,
    "genres" TEXT[],
    "urlImage" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "startDateYear" TEXT NOT NULL,
    "nbEps" INTEGER,
    "synopsis" TEXT,
    "coverUrl" TEXT,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_id_key" ON "Anime"("id");
