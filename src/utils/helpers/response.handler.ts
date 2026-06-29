import { Request, Response } from 'express';

interface SuccessOptions {
    message: string;
    code: number;
    data?: unknown;
}

interface FailOptions {
    message: string;
    code: number;
    data?: unknown;
}

export class ResponseHandler {
    constructor(
        private readonly req: Request,
        private readonly res: Response
    ){}

    success({ message, code, data }: SuccessOptions) {
        return this.res.status(code).json({
            success: true,
            message,
            url: this.req.originalUrl,
            data: data ?? null,
        });
    }

    fail({ message, code, data }: FailOptions) {
        return this.res.status(code).json({
            success: false,
            message,
            url: this.req.originalUrl,
            data: data ?? null,
        })
    }
}