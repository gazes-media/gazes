import type { Anime, Episode, Latest, Prisma, PrismaClient } from "@prisma/client";
import he from "he";
import { fetchType } from "../utils/fetchUtils";
import { CacheManager } from "../utils/cacheManager";
import { AnimeListQuerystring, AnimeWithEpisodes } from "@api/contracts/animesContract";
import { getEnv } from "@api/config";

/**
 * Service class for handling anime data operations.
 */
export class AnimeService {
	constructor(
		private readonly prismaClient: PrismaClient,
		private readonly cacheManager: CacheManager,
	) {}

	public async getAnimeById(animeId: number): Promise<Anime> {
		const cacheKey = `animeDetails:${animeId}`;

		// If the anime is cached, return it
		const cachedAnime: AnimeWithEpisodes = await this.cacheManager.getCache(cacheKey);
		if (cachedAnime) return cachedAnime;

		// Get the anime from the database
		let anime = await this.prismaClient.anime.findUnique({
			where: { id: animeId },
			include: { episodes: true },
		});

		if (!anime) return undefined;

		// Fetch the anime details if not already detailed
		if (!anime.cover_url || anime.status !== "1") anime = await this.updateAnimeDetails(anime);

		await this.cacheManager.setCache(cacheKey, anime);
		return anime;
	}

	public async getAndEnrichAnimesList({ page = 1, title, genres, status, releaseDate }: AnimeListQuerystring): Promise<Anime[]> {
		const cacheKey = `animesList:${page}:${title}:${genres}:${status}:${releaseDate}`;

		// If the request is cached, return it
		const cachedResult: Anime[] = await this.cacheManager.getCache(cacheKey);
		if (cachedResult) return cachedResult;

		const queryOptions = this.buildQueryOptions({ page, genres, releaseDate, status, title });

		let animesList = await this.prismaClient.anime.findMany(queryOptions);
		animesList = await this.enrichAnimesDetails(animesList);

		await this.cacheManager.setCache(cacheKey, animesList);
		return animesList;
	}

	private async enrichAnimesDetails(animesList): Promise<AnimeWithEpisodes[]> {
		const animesDetailsRequiredList = animesList.filter((anime) => !anime.synopsis);

		if (animesDetailsRequiredList.length > 0) {
			const detailedAnimePromises = animesDetailsRequiredList.map((anime) => this.getAnimeById(anime.id));
			return (await Promise.all(detailedAnimePromises)).map(({episodes, ...anime}) => anime);
		}

		return animesList; // Return the original list if no enrichment is required
	}

	public async getLatestAnimes(): Promise<Latest[]> {
		let latestAnimeList = await this.cacheManager.getCache<Latest[]>("latestAnimes");
		if(!latestAnimeList) {
			latestAnimeList = await this.prismaClient.latest.findMany({
				orderBy: { timestamp: "desc" },
				include: { anime: true },
			});
			await this.cacheManager.setCache("latestAnimes", latestAnimeList);
		}
		return latestAnimeList;
	}

	private buildQueryOptions({
		page,
		title,
		genres,
		status,
		releaseDate,
	}: { page: number; title: string; genres: string; status: number; releaseDate: number }): Prisma.AnimeFindManyArgs {
		return {
			skip: 25 * (page - 1),
			take: 25,
			where: {
				others: title ? { search: title.split(" ").join(" & ") } : undefined,
				genres: genres ? { hasEvery: genres.split(",") } : undefined,
				status: status ? { equals: status.toString() } : undefined,
				start_date_year: releaseDate ? { equals: releaseDate.toString() } : undefined,
			},
		};
	}

	private async updateAnimeDetails(anime: Anime): Promise<{ episodes: Episode[] } & Anime> {
		const animeHtml = await fetchType<string>(`${getEnv("NEKO_URL")}/${anime.url}`, "text");
		if (!animeHtml) return undefined;

		const status = this.extractStatus(animeHtml);
		const synopsis = this.extractSynopsis(animeHtml);
		const cover_url = this.extractCoverUrl(animeHtml);
		const newEpisodes = this.extractEpisodes(animeHtml);

		return await this.prismaClient.anime.update({
			where: { id: anime.id },
			data: {
				synopsis,
				cover_url,
				status,
				nb_eps: newEpisodes.length,
				episodes: {
					createMany: {
						data: newEpisodes,
						skipDuplicates: true,
					},
				},
			},
			include: { episodes: true },
		});
	}

	public async getEpisodeVideo(episode: Episode, vf = false): Promise<string | undefined> {
		const proxiedEpisodeUrl = new URL(vf ? episode.url.replace("vostfr", "vf") : episode.url, getEnv("NEKO_URL")).toString();

		try {
			const episodeHtml = await fetchType<string>(proxiedEpisodeUrl, "text");
			const playerUrlMatch = episodeHtml?.match(/video\[0\] = '([^']*)';/);
			if (!playerUrlMatch) return undefined;

			const playerHtml = await fetchType<string>(new URL(encodeURIComponent(playerUrlMatch[1]), getEnv("PROXY_URL")).toString(), "text");
			const scriptUrlMatch = playerHtml?.match(/src="(https?:\/\/[^"]*\/f\/u\/u[^"]*)"/);
			if (!scriptUrlMatch) return undefined;

			const scriptJs = await fetchType<string>(new URL(encodeURIComponent(scriptUrlMatch[1]), getEnv("PROXY_URL")).toString(), "text");
			const videoObjectEncodedMatch = scriptJs?.match(/atob\("([^"]+)"/);
			if (!videoObjectEncodedMatch) return undefined;

			const videoObject = atob(videoObjectEncodedMatch[1]);
			const videoUrlMatch = videoObject.match(/"ezofpjbzoiefhzofsdhvuzehfg"\s*:\s*"([^"]+)"/);
			if (!videoUrlMatch) return undefined;

			return new URL(encodeURIComponent(videoUrlMatch[1].replace(/\\/g, "")), getEnv("PROXY_URL")).toString();
		} catch (error) {
			console.error("Failed to fetch episode video:", error);
			return undefined;
		}
	}

	private extractStatus(html: string): string {
		const statusMatch = html.match(/<small>Status<\/small>\s*(\w+)/);
		return statusMatch && statusMatch[1] === "En cours" ? "1" : "2";
	}

	private extractSynopsis(html: string): string {
		const synopsisMatch = /<div class="synopsis">\s*<p>\s*([\s\S]*?)\s*<\/p>/im.exec(html);
		return synopsisMatch ? he.decode(synopsisMatch[1].replace(/<[^>]*>/g, "")) : "";
	}

	private extractCoverUrl(html: string): string {
		return html.match(/<div id="head" style="background-image: url\((.*?)\);/)?.[1] ?? "";
	}

	private extractEpisodes(html: string): Episode[] {
		const episodesMatch = html.match(/var episodes = (\[.*?\]);/s);
		if (!episodesMatch) return [];

		try {
			const episodes = JSON.parse(episodesMatch[1]);
			return episodes.map(({ title, ...newEpisode }: { title: string } & Episode) => newEpisode);
		} catch (e) {
			console.error("Error parsing episodes JSON:", e);
			return [];
		}
	}
}
