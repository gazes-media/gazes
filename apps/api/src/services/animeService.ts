import type { RedisClientType } from "redis";
import { CacheService } from "./cacheService";
import type { Anime, PrismaClient } from "@prisma/client";
import { fetchType } from "@/utils/fetchUtils";
import type { FetchedAnime } from "@/types/animeTypes";
import { getEnv } from "@/utils/envUtils";
import type { AnimeListQuerystring } from "@/types/routeTypes";

const HOUR = 3.6e6;

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

		const animesList = await fetchType<FetchedAnime[]>(getEnv("NEKO_JSON_URL"), "json");
		const animesData = animesList.map((anime) => this.mapAnimeData(anime));

		await this.prismaClient.anime.createMany({
			data: animesData,
			skipDuplicates: true,
		});
	}

	private mapAnimeData(anime: FetchedAnime): Omit<Anime, "createdAt" | "updatedAt"> {
		return {
			id: anime.id,
			titleOriginal: anime.title,
			titleEnglish: anime.title_english,
			titleRomanized: anime.title_romanji,
			titleFrench: anime.title_french,
			alternativeTitles: (anime.others + anime.title + anime.title_english + anime.title_french + anime.title_romanji).replace(/ /g, "").toLowerCase(),
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
			synopsis: null,
		};
	}

	public async getAnimeListByFilters(options: AnimeListQuerystring): Promise<Anime[]> {
		const animesList = await this.prismaClient.anime.findMany({
			where: {
				alternativeTitles: {
					contains: options.title?.toLowerCase().trim().replace(/ /, "")
				}
			}
		});

		return animesList;
	}
}
