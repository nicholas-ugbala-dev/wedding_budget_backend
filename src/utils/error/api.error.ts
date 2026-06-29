import { Request, Response, NextFunction } from 'express';
import { success, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';


export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly details?: string;

    constructor(statusCode: number, message: string, details?: string) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static appError(
        err: unknown,
        _req: Request,
        res: Response,
        next: NextFunction
    ): void {
        if (err instanceof ZodError) {
            const { message } = err;
            res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                success: false,
                message: 'Validation failed',
                errors: JSON.parse(message)
                .map(
                    (err: {message: string, path: string}) => 
                    `${err.path}: ${err.message} \n`
                )
            });
            return;
        }
        if (err instanceof ApiError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message,
                details: err.details ?? null,
            });
            return;
        }
        next(err);
    }

    static genericError(
        err: unknown,
        _req: Request,
        res: Response,
        _next: NextFunction
    ): void {
        console.error('Unhandled error:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'An error occurred, we are looking into it.',
        });
    }
}