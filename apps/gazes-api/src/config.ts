export const config = {
    PROXY_URL: 'https://proxy.ketsuna.com?url=',
    NEKO_JSON_URL: 'https://neko.ketsuna.com/animes-search-vostfr.json',
    NEKO_URL: 'https://neko.ketsuna.com',
    HOST: process.env.HOST ?? "localhost",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
}