import { FastifyInstance } from "fastify";
import {
  AnimeDetailParams,
  AnimeDetailParamsSchema,
  AnimeListQuerystring,
  AnimeListQuerystringSchema,
  EpisodeParams,
  EpisodeParamsSchema,
} from "../../contracts/animesContract";
import { getAnimeById, getEpisodeVideo } from "../services/animeService";
import { AppOptions } from "../../main";

export default async function (fastify: FastifyInstance, {redis, prisma}: AppOptions) {

  fastify.get<{ Querystring: AnimeListQuerystring }>(
    "/animes",
    {
      schema: { querystring: AnimeListQuerystringSchema },
    },
    async function (req, rep) {
      const { page = 1, title, genres, status, releaseDate } = req.query;

      let findManyObject = {
        skip: 25 * (page - 1),
        take: 25 * page,
        where: {}
      };

      if (title) findManyObject["where"]["others"] = {"search": title.split(" ").join(" & ")};
      if (genres) findManyObject["where"]["Genres"] = {"hasEvery": genres.split(",")};
      if (status) findManyObject["where"]["Status"] = {"equals": status.toString()};
      if (releaseDate) findManyObject["where"]["StartDateYear"] = {"equals": releaseDate.toString()};

      console.log(findManyObject)

      const receivedAnimeList = await prisma.anime.findMany(findManyObject);
      rep.send(receivedAnimeList).status(200);
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

      const anime = await getAnimeById(prisma, redis, id);

      if (!anime) {
        rep.status(404).send("Anime Not Found");
        return;
      }

      if (ep > anime.episodes.length) {
        rep.status(404).send("Episode Not Found");
        return;
      }

      const episodeKey = `episode:${id}:${ep}`;
      const episode = anime.episodes.at(ep - 1);

      let cachedEpisode = await redis.get(episodeKey);

      let {vf = null, vostfr = null} = cachedEpisode ? JSON.parse(cachedEpisode) : {};

      if (!vostfr) vostfr = await getEpisodeVideo(episode);
      if (!vf) vf = await getEpisodeVideo(episode, true);

      await redis.set(episodeKey, JSON.stringify({ vf, vostfr }));
      await redis.expireAt(episodeKey, Date.now() + 7200000);

      rep.status(200).send({
        anime, episode,
        videos: { vostfr, vf },
      });
    }
  );
}
