import {
    AnimeListQuerystring,
    AnimeListQuerystringSchema,
    AnimeDetailParams,
    AnimeDetailParamsSchema,
    EpisodeParams,
    EpisodeParamsSchema,
} from '@api/contracts/animesContract';
import { FastifyInstance } from 'fastify';
import { AppOptions } from '@api/main';
import { AnimeService } from '../services/animeService';

/**
 * Initializes anime listing and detail routes.
 *
 * @param {FastifyInstance} fastify - The Fastify instance.
 * @param {AppOptions} options - The application options including Redis and Prisma clients.
 */
export default async function (fastify: FastifyInstance, { redis, prisma }: AppOptions) {
    const animeService = new AnimeService(prisma, redis);

    /**
     * Route serving a paginated list of animes with optional filtering.
     *
     * @route GET /animes
     * @param {AnimeListQuerystring} req.query - Filters for the anime list.
     * @returns {void}
     */
    fastify.get<{ Querystring: AnimeListQuerystring }>(
        '/animes',
        { schema: { querystring: AnimeListQuerystringSchema } },
        async (req, rep) => {
            const { page = 1, title, genres, status, releaseDate } = req.query;
            let queryOptions = {
                skip: 25 * (page - 1),
                take: 25,
                where: {},
            };

            if (title) queryOptions.where['others'] = { search: title.split(' ').join(' & ') };
            if (genres) queryOptions.where['genres'] = { hasEvery: genres.split(',') };
            if (status) queryOptions.where['status'] = { equals: status.toString() };
            if (releaseDate) queryOptions.where['start_date_year'] = { equals: releaseDate.toString() };

            const animeList = await prisma.anime.findMany(queryOptions);
            rep.status(200).send(animeList);
        }
    );

    /**
     * Route serving the latest episodes of animes.
     *
     * @route GET /animes/latests
     * @returns {void}
     */
    fastify.get('/animes/latests', async (req, rep) => {
        try {
            let cachedLatestList = await redis.get('latests');

            if (cachedLatestList) {
                rep.status(200).send(JSON.parse(cachedLatestList));
                return;
            }

            const latestList = await prisma.latest.findMany({
                orderBy: { timestamp: 'desc' },
                include: { anime: true },
            });

            const mappedLatestList = latestList.map(({ timestamp, ...remains }) => ({
                timestamp: timestamp.getTime(),
                ...remains,
            }));

            await redis.set('latests', JSON.stringify(mappedLatestList));
            await redis.expireAt('latests', Date.now() + 3600000);

            rep.status(200).send(mappedLatestList);
        } catch (err) {
            console.error('Failed to fetch latest animes:', err);
            rep.status(500).send({ error: 'Internal Server Error' });
        }
    });

    /**
     * Route retrieving detailed information for a specified anime by ID.
     *
     * @route GET /animes/:id
     * @param {AnimeDetailParams} req.params - The ID of the anime.
     * @returns {void}
     */
    fastify.get<{ Params: AnimeDetailParams }>(
        '/animes/:id',
        { schema: { params: AnimeDetailParamsSchema } },
        async (req, rep) => {
            const anime = await animeService.getAnimeById(req.params.id);

            if (!anime) {
                rep.status(404).send('Anime Not Found');
                return;
            }

            rep.status(200).send(anime);
        }
    );

    /**
     * Route for retrieving video links for a specific anime episode.
     *
     * @route GET /animes/:id/:ep
     * @param {EpisodeParams} req.params - The ID of the anime and the episode number.
     * @returns {void}
     */
    fastify.get<{ Params: EpisodeParams }>(
        '/animes/:id/:ep',
        { schema: { params: EpisodeParamsSchema } },
        async (req, rep) => {
            const { id, ep } = req.params;

            if (ep <= 0) {
                rep.status(404).send('Episode Not Found');
                return;
            }

            const { episodes, ...anime } = await animeService.getAnimeById(id);

            if (!anime) {
                rep.status(404).send('Anime Not Found');
                return;
            }

            if (ep > episodes.length) {
                rep.status(404).send('Episode Not Found');
                return;
            }

            const episodeKey = `episode:${id}:${ep}`;
            let cachedEpisode = await redis.get(episodeKey);
            let { vf = null, vostfr = null } = cachedEpisode ? JSON.parse(cachedEpisode) : {};

            if (!vostfr) vostfr = await animeService.getEpisodeVideo(episodes[ep - 1]);
            if (!vf) vf = await animeService.getEpisodeVideo(episodes[ep - 1], true);

            await redis.set(episodeKey, JSON.stringify({ vf, vostfr }));
            await redis.expireAt(episodeKey, Date.now() + 7200000);

            rep.status(200).send({
                anime,
                episode: episodes[ep - 1],
                videos: { vostfr, vf },
            });
        }
    );
}
