import Fastify from "fastify";
import { app } from "./app/app";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { config } from "./config";

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

  if (process.env.NODE_ENV === 'development') {
    redis.flushDb();
  }

  // Register your application as a normal plugin.
  server.register((fastify, opts) => app(fastify, { prisma, redis, ...opts }));

  // Start listening.
  server.listen({port: config.PORT, host: config.HOST}, (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }

      server.log.info(`[ ready ] http://${config.HOST}:${config.PORT}`);
    }
  );
}

main().finally(() => {
  console.log("test")
});
