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

  });

  /**
   * @fileoverview This handler retrieves detailed information for a specified anime identified by its unique ID.
   * 
   * The route defined by this handler is part of the Anime details API, enabling client to query detailed information
   * about a single anime. This includes its title, synopsis, cover image, episode, and more. The anime ID used to fetch
   * the details is provided as a URL parameter; This handler makes use of a service function 'getAnimeById' which abstracts
   * the logic for retrieving the anime details from the database or cache, providing a clean separation of concerns.
   * 
   * URL Parameters:
   * - 'id': The unique identifier of the anime to retrieve. This must be a valid integer corresponding to the ID of the anime
   * in the database.
   * 
   * Responses:
   * - 200 OK: Successfully retrieved the details of the requested anime. The response body contains the anime object.
   * - 404 Not Found: No anime could be found for the given ID. This indicates either an invalid or that the requested anime 
   * does not exists in the database
   * - 500 Internal Server Error: An error occurered on the server while processing the request. This indicates an unexpected
   * issue that prevented the server from fulfilling the request.
   */
  fastify.get<{ Params: AnimeDetailParams }>("/animes/:id", { 
    schema: { params: AnimeDetailParamsSchema } 
  }, async (req, rep) => {
     
    // Attempt to retrieve the anime details using the provided ID
    const anime = await getAnimeById(prisma, redis, req.params.id);

    // Check if the anime was found and respond accordingly
    if (!anime) {
      rep.status(404).send("Anime Not Found");
      return;
    }

    // Respond with the found anime details
    rep.status(200).send(anime);
  
  });

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
