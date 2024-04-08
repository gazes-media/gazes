import { Context, Hono } from "hono";

export default new Hono()
    .get('/', getAnimes)

async function getAnimes(c: Context): Promise<Response> {
    return new Response('Hello World')
}

