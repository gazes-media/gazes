export const config = {
    PROXY_URL: 'https://proxy.ketsuna.com?url=',
    NEKO_JSON_URL: 'https://neko.ketsuna.com/animes-search-vostfr.json',
    NEKO_URL: 'https://neko.ketsuna.com',
    HOST: process.env.HOST ?? "localhost",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    JWT_SECRET: "976f92162f04ca0b322459b2bbc98cbb46b9ad227c1c4eca5b83195b1df168a2"
}