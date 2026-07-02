import morgan from 'morgan'
import { logger } from './index'

// Pipe Morgan output into Winston at the 'http' level
const stream = { write: (message: string) => logger.http(message.trim()) }

// 'dev' format: GET /api/v1/auth/me 200 12ms
export const httpLogger = morgan('dev', { stream })
