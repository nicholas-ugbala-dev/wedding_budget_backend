import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "../../lib/logger";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

pool.connect()
    .then(client => {
        logger.info('Database connected');
        client.release();
    })
    .catch(err => {
        logger.error('Database connection failed', { error: err.message });
        process.exit(-1);
    });

pool.on('error', (err) => {
    logger.error('Unexpected database error', { error: err.message });
    process.exit(-1);
})

export default pool;