import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { ICategoriesService } from './interface/categories.interface';
import { CreateCategoryValidator, UpdateCategoryValidator } from './validation/categories.validations';
import categoriesService from './categories.service';

export class CategoriesController {
    constructor(private readonly service: ICategoriesService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const ceremony = req.query.ceremony as string | undefined;
        const data = await this.service.list(userId, ceremony);

        new ResponseHandler(req, res).success({
            message: 'Categories fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as CreateCategoryValidator;
        const data = await this.service.create(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Category created successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const body = req.body as UpdateCategoryValidator;
        const data = await this.service.update(id, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Category updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        await this.service.delete(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Category deleted successfully',
            code: StatusCodes.OK,
        });
    };
}

export const categoriesController = new CategoriesController(categoriesService);
