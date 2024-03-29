export const config = {
    PROXY_URL: 'https://proxy.ketsuna.com?url=',
    NEKO_JSON_URL: 'https://neko.ketsuna.com/animes-search-vostfr.json',
    HOST: process.env.HOST ?? "localhost",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
}