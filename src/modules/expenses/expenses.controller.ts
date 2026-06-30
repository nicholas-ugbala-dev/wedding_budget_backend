import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { IExpensesService } from './interface/expenses.interface';
import {
    CreateExpenseValidator,
    UpdateExpenseValidator,
    ListExpensesValidator,
} from './validation/expenses.validations';
import expensesService from './expenses.service';

export class ExpensesController {
    constructor(private readonly service: IExpensesService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const filters = req.query as unknown as ListExpensesValidator;
        const data = await this.service.list(userId, filters);

        new ResponseHandler(req, res).success({
            message: 'Expenses fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    get = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const data = await this.service.get(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Expense fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as CreateExpenseValidator;
        const data = await this.service.create(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Expense created successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const body = req.body as UpdateExpenseValidator;
        const data = await this.service.update(id, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Expense updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        await this.service.delete(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Expense deleted successfully',
            code: StatusCodes.OK,
        });
    };
}

export const expensesController = new ExpensesController(expensesService);
