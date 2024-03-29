import { getAnimeById, getEpisodeVideo } from "@app/services/animeService";
import {
  AnimeListQuerystring,
  AnimeListQuerystringSchema,
  AnimeDetailParams,
  AnimeDetailParamsSchema,
  EpisodeParams,
  EpisodeParamsSchema,
} from "@contracts/animesContract";
import { FastifyInstance } from "fastify";
import { AppOptions } from "main";

export default async function (fastify: FastifyInstance, { redis, prisma }: AppOptions) {
  /**
   * @fileoverview This handler provides a paginated list of animes, with optional filtering based on title, genres, status, and release year.
   *
   * The route defined by this handler is part of the Anime listing API, allowing clients to query for animes stored in the database
   * with various filtering options to narrow down the search results. Pagination is implemented to limit the number of results returned
   * in a single request, improving performance and usability for both the server and client.
   *
   * Query Parameters:
   * - `page`: (Optional) The page number for pagination. Defaults to 1 if not specified.
   * - `title`: (Optional) A string to filter animes by their titles. Supports partial matches.
   * - `genres`: (Optional) A comma-separated list of genres to filter animes by. An anime must match all specified genres.
   * - `status`: (Optional) The publication status of the anime to filter by (e.g., "ongoing", "completed").
   * - `releaseDate`: (Optional) The release year of the anime to filter by.
   *
   * Responses:
   * - 200 OK: Successfully retrieved a list of animes based on the query parameters. The response body contains an array of anime objects.
   * - 400 Bad Request: The request was malformed. This can happen if the query parameters are not in the expected format.
   * - 500 Internal Server Error: An error occurred on the server while processing the request.
   */
  fastify.get<{ Querystring: AnimeListQuerystring }>("/animes", {
    schema: { querystring: AnimeListQuerystringSchema },
  }, async (req, rep) => {
     
      // Extract query parameters with default values
      const { page = 1, title, genres, status, releaseDate } = req.query;

      // Prepare the Prisma findMany query object with pagination and conditional filters
      let queryOptions = {
        skip: 25 * (page - 1), // Calculate offset for pagination
        take: 25, // Limit the number of returned items to 25 for pagination
        where: {},
      };

      // Conditional filters based on the query parameters provided by the client
      if (title) queryOptions["where"]["others"] = { search: title.split(" ").join(" & ") };
      if (genres) queryOptions["where"]["genres"] = { hasEvery: genres.split(",") };
      if (status) queryOptions["where"]["status"] = { equals: status.toString() };
      if (releaseDate) queryOptions["where"]["start_date_year"] = { equals: releaseDate.toString() };

      // Execute the query using the Prisma client and send the result back to the client
      const animeList = await prisma.anime.findMany(queryOptions);
      rep.status(200).send(animeList);
      
    }
  );

  fastify.get<{ Params: AnimeDetailParams }>(
    "/animes/:id",
    { schema: { params: AnimeDetailParamsSchema } },
    async (req, rep) => {
      const { id } = req.params;

      const receivedAnime = await getAnimeById(prisma, redis, id);

      if (!receivedAnime) {
        rep.status(404).send("Not Found");
        return;
      }

      rep.status(200).send(receivedAnime);
    }
  );

  fastify.get<{ Params: EpisodeParams }>(
    "/animes/:id/:ep",
    { schema: { params: EpisodeParamsSchema } },
    async (req, rep) => {
      const { id, ep } = req.params;

      if (ep <= 0) {
        rep.status(404).send("Episode Not Found");
        return;
      }

      const { episodes, ...anime } = await getAnimeById(prisma, redis, id);

      if (!anime) {
        rep.status(404).send("Anime Not Found");
        return;
      }

      if (ep > episodes.length) {
        rep.status(404).send("Episode Not Found");
        return;
      }

      const episodeKey = `episode:${id}:${ep}`;
      const episode = episodes.at(ep - 1);

      let cachedEpisode = await redis.get(episodeKey);

      let { vf = null, vostfr = null } = cachedEpisode ? JSON.parse(cachedEpisode) : {};

      if (!vostfr) vostfr = await getEpisodeVideo(episode);
      if (!vf) vf = await getEpisodeVideo(episode, true);

      await redis.set(episodeKey, JSON.stringify({ vf, vostfr }));
      await redis.expireAt(episodeKey, Date.now() + 7200000);

      rep.status(200).send({
        anime,
        episode,
        videos: { vostfr, vf },
      });
    }
  );
}
