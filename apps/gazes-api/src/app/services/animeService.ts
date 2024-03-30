import { config } from '@api/config';
import { RedisClient } from '@api/main';
import { Anime, Episode, PrismaClient } from '@prisma/client';
import he from 'he';
import { fetchType } from '../utils/fetchUtils';

/**
 * Service class for handling anime data operations.
 */
export class AnimeService {
    prisma: PrismaClient;
    redis: RedisClient;

    /**
     * Constructs a new instance of the AnimeService class.
     *
     * @param {PrismaClient} prisma - The Prisma client for database operations.
     * @param {RedisClient} redis - The Redis client for caching operations.
     */
    constructor(prisma: PrismaClient, redis: RedisClient) {
        this.prisma = prisma;
        this.redis = redis;
    }

    /**
     * Extracts the publication status from HTML content.
     *
     * @private
     * @param {string} html - The HTML content to parse.
     * @returns {string} The publication status.
     */
    private extractStatus(html: string): string {
        const statusMatch = html.match(/<small>Status<\/small>\s*(\w+)/);
        return statusMatch && statusMatch[1] === 'En cours' ? '1' : '2';
    }

    /**
     * Extracts the synopsis from HTML content.
     *
     * @private
     * @param {string} html - The HTML content to parse.
     * @returns {string} The extracted synopsis.
     */
    private extractSynopsis(html: string): string {
        const synopsisMatch = /<div class="synopsis">\s*<p>\s*([\s\S]*?)\s*<\/p>/im.exec(html);
        return synopsisMatch ? he.decode(synopsisMatch[1].replace(/<[^>]*>/g, '')) : '';
    }

    /**
     * Extracts the cover URL from HTML content.
     *
     * @private
     * @param {string} html - The HTML content to parse.
     * @returns {string} The URL of the cover image.
     */
    private extractCoverUrl(html: string): string {
        return html.match(/<div id="head" style="background-image: url\((.*?)\);/)?.[1] ?? '';
    }

    /**
     * Extracts a list of episodes from HTML content.
     *
     * @private
     * @param {string} html - The HTML content to parse.
     * @returns {Episode[]} An array of Episode objects.
     */
    private extractEpisodes(html: string): Episode[] {
        const episodesMatch = html.match(/var episodes = (\[.*?\]);/s);
        if (!episodesMatch) return [];

        try {
            const episodes = JSON.parse(episodesMatch[1]);
            return episodes.map(({ title, ...newEpisode }: { title: string } & Episode) => newEpisode);
        } catch (e) {
            console.error('Error parsing episodes JSON:', e);
            return [];
        }
    }

    /**
     * Retrieves an anime by its ID, optionally updating it with external details.
     *
     * @param {number} id - The ID of the anime to retrieve.
     * @returns {Promise<({ episodes: Episode[] } & Anime) | undefined>} The anime object or undefined if not found.
     */
    public async getAnimeById(id: number): Promise<({ episodes: Episode[] } & Anime) | undefined> {
        const cachedAnime = await this.redis.get(`anime:${id}`);
        if (cachedAnime) return JSON.parse(cachedAnime);

        let anime = await this.prisma.anime.findUnique({
            where: { id },
            include: { episodes: true },
        });

        if (!anime) return undefined;
        if (!anime.cover_url || anime.status !== '1') anime = await this.updateAnimeDetails(anime);

        await this.redis.set(`anime:${id}`, JSON.stringify(anime));
        await this.redis.expireAt(`anime:${id}`, Date.now() + 7200000);

        return anime;
    }

    /**
     * Updates the details of an anime by fetching them from an external source.
     *
     * @private
     * @param {Anime} anime - The Anime object to update.
     * @returns {Promise<{ episodes: Episode[] } & Anime>} The updated anime object.
     */
    private async updateAnimeDetails(anime: Anime): Promise<{ episodes: Episode[] } & Anime> {
        const animeHtml = await fetchType<string>(`${config.NEKO_URL}/${anime.url}`, 'text');
        if (!animeHtml) return undefined;

        const status = this.extractStatus(animeHtml);
        const synopsis = this.extractSynopsis(animeHtml);
        const cover_url = this.extractCoverUrl(animeHtml);
        const newEpisodes = this.extractEpisodes(animeHtml);

        return await this.prisma.anime.update({
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

    /**
     * Retrieves the video URL for a specified episode, optionally in a VF (French Dub) version.
     *
     * @param {Episode} episode - The Episode object.
     * @param {boolean} [vf=false] - Whether to fetch the VF version.
     * @returns {Promise<string | undefined>} The URL of the episode video or undefined if not found.
     */
    public async getEpisodeVideo(episode: Episode, vf: boolean = false): Promise<string | undefined> {
        const proxiedEpisodeUrl = new URL(
            vf ? episode.url.replace('vostfr', 'vf') : episode.url,
            config.NEKO_URL
        ).toString();

        try {
            const episodeHtml = await fetchType<string>(proxiedEpisodeUrl, 'text');
            const playerUrlMatch = episodeHtml?.match(/video\[0\] = '([^']*)';/);
            if (!playerUrlMatch) return undefined;

            const playerHtml = await fetchType<string>(
                new URL(encodeURIComponent(playerUrlMatch[1]), config.PROXY_URL).toString(),
                'text'
            );
            const scriptUrlMatch = playerHtml?.match(/src="(https?:\/\/[^"]*\/f\/u\/u[^"]*)"/);
            if (!scriptUrlMatch) return undefined;

            const scriptJs = await fetchType<string>(
                new URL(encodeURIComponent(scriptUrlMatch[1]), config.PROXY_URL).toString(),
                'text'
            );
            const videoObjectEncodedMatch = scriptJs?.match(/atob\("([^"]+)"/);
            if (!videoObjectEncodedMatch) return undefined;

            const videoObject = atob(videoObjectEncodedMatch[1]);
            const videoUrlMatch = videoObject.match(/"ezofpjbzoiefhzofsdhvuzehfg"\s*:\s*"([^"]+)"/);
            if (!videoUrlMatch) return undefined;

            return new URL(encodeURIComponent(videoUrlMatch[1].replace(/\\/g, '')), config.PROXY_URL).toString();
        } catch (error) {
            console.error('Failed to fetch episode video:', error);
            return undefined;
        }
    }
}
