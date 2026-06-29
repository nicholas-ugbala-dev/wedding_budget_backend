import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError, Schema } from "zod";
import { StatusCodes } from "http-status-codes";

export class ValidationMiddleware {
    static validateRequest = (schema: ZodType) => {
        return (req: Request, res: Response, next: NextFunction) => {
            schema
            .parseAsync({...req.query, ...req.params, ...req.body })
            .then(() => next())
            .catch(next)
        }
    }
}