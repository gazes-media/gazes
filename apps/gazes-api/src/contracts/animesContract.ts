export interface AnimeListQuerystring {
    page?: number;
    title?: string;
    genres?: string;
    status?: number;
    releaseDate?: number;
}

export const AnimeListQuerystringSchema = {
    type: 'object',
    properties: {
        page: { type: ['number', 'null'] },
        title: { type: ['string', 'null'] },
        genres: { type: ['string', 'null'] },
        status: { type: ['number', 'null'] },
        releaseDate: { type: ['number', 'null'] },
    },
};

export interface AnimeDetailParams {
    id: number;
}

export const AnimeDetailParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
    },
};

export interface EpisodeParams {
    id: number;
    ep: number;
}

export const EpisodeParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        ep: { type: 'number' },
    },
};

export interface Latest {
    timestamp: number;
    episode: string;
    lang: string;
    url: string;
    anime_url: string;
}
