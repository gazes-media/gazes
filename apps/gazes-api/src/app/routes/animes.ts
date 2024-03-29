import { FastifyInstance } from "fastify";
import { prisma } from "../../main";

interface IQuerystring {
  page?: number;
  title?: string;
  genres?: string;
  status?: number;
  releaseDate?: number;
}

const queryStringJsonSchema = {
  type: "object",
  properties: {
    page: { type: ["number", "null"] },
    title: { type: ["string", "null"] },
    genres: { type: ["string", "null"] },
    status: { type: ["number", "null"] },
    releaseDate: { type: ["number", "null"] },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: IQuerystring }>(
    "/animes",
    {
      schema: { querystring: queryStringJsonSchema },
    },
    async function (req, rep) {
      const { page = 1, title, genres, status, releaseDate } = req.query;

      let findManyObject = {
        skip: 25 * (page - 1),
        take: 25 * page,
      };

      if (title) {
        findManyObject["where"] = {
          others: {
            search: title?.split(" ").join(" & "),
          },
        };
      }

      if (genres) {
        findManyObject["where"] = {
          ...findManyObject["where"],
          Genres: {
            hasEvery: genres?.split(","),
          },
        };
      }

      if (status) {
        findManyObject["where"] = {
          ...findManyObject["where"],
          Status: {
            equals: status?.toString(),
          },
        };
      }

      if (releaseDate) {
        findManyObject["where"] = {
          ...findManyObject["where"],
          StartDateYear: {
            equals: releaseDate?.toString(),
          },
        };
      }

      const receivedAnimeList = await prisma.anime.findMany(findManyObject)
      rep.send(receivedAnimeList).status(200);
    }
  );
}
