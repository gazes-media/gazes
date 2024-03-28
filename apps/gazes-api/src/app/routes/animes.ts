import { FastifyInstance } from "fastify";
import { prisma } from "../../main";

interface IQuerystring {
    page?: number
    title?: string
    genres?: string
    status?: number
    releaseDate?: number
}

const queryStringJsonSchema = {
    type: 'object',
    properties: {
        page: {type: ['number', 'null']},
        title: {type: ['string', 'null'] },
        genres: {type: ['string', 'null']},
        status: {type: ['number', 'null']},
        releaseDate: {type: ['number', 'null']}
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get<{ Querystring: IQuerystring }>('/animes', {
        schema: { querystring: queryStringJsonSchema }
    }, async function (req, rep) {
        const { page = 1, title, genres, status, releaseDate } = req.query

        console.log(genres)

        return prisma.anime.findMany({
            skip: 25 * (page - 1),
            take: 25 * page,
            where: {
                others: {
                    search: title?.split(" ").join(" & ")
                },

                Genres: {
                    hasEvery: genres?.split(',')
                },

                Status: {
                    equals: status?.toString()
                },

                StartDateYear: {
                    equals: releaseDate?.toString()
                }
            }
        })
    });
}
