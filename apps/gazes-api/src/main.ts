import { app } from "@api/app/app";
import { config } from "@api/config";
import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import { createClient } from "redis";

export const server = Fastify({
  logger: true,
});

const prisma = new PrismaClient();
const redis = createClient();

export type RedisClient = typeof redis;
export interface AppOptions {
  prisma: PrismaClient;
  redis: RedisClient;
}

async function main() {
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

main()

process.on('exit', () => {
  prisma.$disconnect()
  redis.disconnect()
})