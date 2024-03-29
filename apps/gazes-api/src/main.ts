import Fastify from "fastify";
import { app } from "./app/app";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export const PROXY_URL = 'https://proxy.ketsuna.com?url='

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export const server = Fastify({
  logger: false,
});

const prisma = new PrismaClient();
const redis = createClient();

export type RedisClient = typeof redis;
export interface AppOptions {
  prisma: PrismaClient;
  redis: RedisClient;
}

async function main() {
  await prisma.$connect();
  await redis.connect();

  redis.flushDb()

  // Register your application as a normal plugin.
  server.register((fastify, opts) => app(fastify, { prisma, redis, ...opts }));

  // Start listening.
  server.listen({ port, host }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    console.log(`[ ready ] http://${host}:${port}`);
  });
}

main()