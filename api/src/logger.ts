import pino from "pino";
import { existsSync, mkdirSync } from "fs";

if (!existsSync("logs")) {
  mkdirSync("logs")
}

const now = new Date()

const transport = pino.transport({
  targets: [
    {
      level: "trace",
      target: "pino/file",
      options: {
        destination: `logs/${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`
      }
    },
    {
      level: 'trace',
      target: 'pino-pretty',
      options: {}
    }
  ]
})

export const logger = pino({}, transport);
