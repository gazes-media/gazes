import fs from 'fs'
import pino from 'pino'

function getLogFileName() {
  const now = new Date()
  return `${getFullNumeral(now.getDay())}-${getFullNumeral(now.getMonth())}-${now.getFullYear()}`
}

function getFullNumeral(n: number) {
  if (n.toString().length <= 1) return '0' + n
  else return n.toString()
}

// if log folder doesn't exists, create it
if (!fs.existsSync('logs')) fs.mkdirSync('logs')

export const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {},
      },
      {
        target: 'pino/file',
        options: { destination: `logs/${getLogFileName()}` },
      },
    ],
  },
})
