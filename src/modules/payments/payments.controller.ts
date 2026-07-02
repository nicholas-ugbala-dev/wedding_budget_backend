import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { IPaymentsService } from './interface/payments.interface';
import {
    CreatePaymentValidator,
    ListPaymentsValidator,
    PaymentsSummaryValidator,
    UpdatePaymentValidator,
} from './validation/payments.validations';
import paymentsService from './payments.service';
import { PAYMENT_TYPES } from './constants/payment-types';

export class PaymentsController {
    constructor(private readonly service: IPaymentsService) {}

    listTypes = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        new ResponseHandler(_req, res).success({
            message: 'Payment types fetched successfully',
            code: StatusCodes.OK,
            data: PAYMENT_TYPES,
        });
    };

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const filters = req.query as unknown as ListPaymentsValidator;
        const data = await this.service.list(userId, filters);

        new ResponseHandler(req, res).success({
            message: 'Payments fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    summary = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { ceremony_id } = req.query as unknown as PaymentsSummaryValidator;
        const data = await this.service.summary(userId, ceremony_id);

        new ResponseHandler(req, res).success({
            message: 'Payment summary fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id: expenseId } = req.params;
        const body = req.body as CreatePaymentValidator;
        const data = await this.service.create(expenseId, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Payment added successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id: expenseId, paymentId } = req.params;
        const body = req.body as UpdatePaymentValidator;
        const data = await this.service.update(paymentId, expenseId, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Payment updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id: expenseId, paymentId } = req.params;
        await this.service.delete(paymentId, expenseId, userId);

        new ResponseHandler(req, res).success({
            message: 'Payment removed successfully',
            code: StatusCodes.OK,
        });
    };
}

export const paymentsController = new PaymentsController(paymentsService);
