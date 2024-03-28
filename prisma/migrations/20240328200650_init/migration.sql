-- CreateTable
CREATE TABLE "Anime" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_english" TEXT NOT NULL,
    "title_romanji" TEXT NOT NULL,
    "others" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Popularity" DOUBLE PRECISION NOT NULL,
    "Url" TEXT NOT NULL,
    "Genres" TEXT[],
    "UrlImage" TEXT NOT NULL,
    "Score" TEXT NOT NULL,
    "StartDateYear" TEXT NOT NULL,
    "NbEps" INTEGER NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);
