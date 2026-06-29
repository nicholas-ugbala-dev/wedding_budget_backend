import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/helpers/token.helper';
import { ApiError } from '../utils/error';

export const tokenGuard = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "No token provided");
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.user = { ...payload };
        next();
    } catch {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
    }
}