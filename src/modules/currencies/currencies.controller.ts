import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { ICurrenciesService } from './interface/currencies.interface';
import { AddCurrencyValidator, listCurrenciesValidator } from './validation/currencies.validations';
import currenciesService from './currencies.service';

export class CurrenciesController {
    constructor(private readonly service: ICurrenciesService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { client_id } = listCurrenciesValidator.parse(req.query);

        const data = client_id ? await this.service.listForClient(userId, client_id) : await this.service.list(userId);

        new ResponseHandler(req, res).success({
            message: 'Currencies fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    add = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as AddCurrencyValidator;
        const data = await this.service.add(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Currency added successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    remove = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { code } = req.params;
        await this.service.remove(userId, code);

        new ResponseHandler(req, res).success({
            message: 'Currency removed successfully',
            code: StatusCodes.OK,
        });
    };
}

export const currenciesController = new CurrenciesController(currenciesService);
