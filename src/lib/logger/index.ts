import winston from 'winston'
import path from 'path'
import fs from 'fs'

const logsDir = path.join(process.cwd(), 'logs')
fs.mkdirSync(logsDir, { recursive: true })

const { combine, timestamp, colorize, printf, json } = winston.format

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] ${level}: ${message}${extra}`
})

const isProd = process.env.NODE_ENV === 'production'

export const logger = winston.createLogger({
  level: isProd ? 'warn' : 'http',
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat,
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: combine(timestamp(), json()),
    }),
  ],
})
