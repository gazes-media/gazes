import type { RedisClientType } from "redis";
import { CacheService } from "./cacheService";
import { fetchType } from "@/utils/fetchUtils";
import { getEnv } from "@/utils/envUtils";
import type { Anime, PrismaClient } from "@prisma/client";

const HOUR = 3.6e+6;

export class AnimeService {
  private cacheService: CacheService;

  constructor(
    private redisClient: RedisClientType,
    private prismaClient: PrismaClient,
  ) {
    this.cacheService = new CacheService(redisClient);
  }

  public async updateDatabase() {
    await this.prismaClient.anime.deleteMany({})
    const animesList: any[] = await fetchType(getEnv("NEKO_JSON_URL"), "json")

    const animesData: Anime[] = animesList.map(anime => ({
      id: anime.id,
      titleOriginal: anime.title,
      titleEnglish: anime.title_english,
      titleRomanized: anime.title_romanji,
      titleFrench: anime.title_french,
      alternativeTitles: anime.others,
      mediaType: anime.type,
      airingStatus: anime.type === "1" ? "en cours" : "finis",
      popularityScore: anime.popularity,
      externalUrl: anime.url,
      genres: anime.genres,
      coverImageUrl: anime.url_image,
      averageScore: Number.parseFloat(anime.score),
      startYear: Number.parseInt(anime.start_date_year),
      episodesCount: Number.parseInt(anime.nb_eps),
      bannerImageUrl: null,
      synopsis: null
    }))

    await this.prismaClient.anime.createMany({
      data: animesData,
      skipDuplicates: true
    })

    setInterval(this.updateDatabase, HOUR)
  }
}
