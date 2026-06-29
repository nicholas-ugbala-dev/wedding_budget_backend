import pool from '../index';
import { QueryResult, QueryResultRow, PoolClient, Pool } from 'pg';
import { ApiError } from '../../../utils/error';

type QueryParams = (string | number | boolean | null)[];

export const dbQuery = {
    one: async <T extends QueryResultRow>(
        query: string,
        params: QueryParams,
        client?: PoolClient
    ): Promise<T> => {
        const db: Pool | PoolClient = client || pool;
        const result: QueryResult<T> = await db.query<T>(query, params);
        if (!result.rows[0]) {
            throw new ApiError(404, "Record not found");
        }
        return result.rows[0];
    },

    oneOrNone: async <T extends QueryResultRow>(
        query: string,
        params: QueryParams,
        client?: PoolClient
    ): Promise<T | null> => {
        const db: Pool | PoolClient = client || pool;
        const result: QueryResult<T> = await db.query<T>(query, params);
        return result.rows[0] || null;
    },

    many: async <T extends QueryResultRow>(
        query: string,
        params: QueryParams,
        client?: PoolClient
    ): Promise<T[]> => {
        const db: Pool | PoolClient = client || pool;
        const result: QueryResult<T> = await db.query<T>(query, params);
        if (result.rows.length === 0) {
            throw new ApiError(404, "Records not found");
        }
        return result.rows;
    },

    manyOrNone: async <T extends QueryResultRow>(
        query: string,
        params: QueryParams,
        client?: PoolClient
    ): Promise<T[] | null> => {
        const db: Pool | PoolClient = client || pool;
        const result: QueryResult<T> = await db.query(query, params);
        return result.rows.length > 0 ? result.rows : null;
    },

    transaction: async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        try{
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },
};