import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { IVendorsService } from './interface/vendors.interface';
import { CreateVendorValidator, UpdateVendorValidator } from './validation/vendors.validations';
import vendorsService from './vendors.service';

export class VendorsController {
    constructor(private readonly service: IVendorsService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const search = req.query.search as string | undefined;
        const data = await this.service.list(userId, search);

        new ResponseHandler(req, res).success({
            message: 'Vendors fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as CreateVendorValidator;
        const data = await this.service.create(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Vendor created successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const body = req.body as UpdateVendorValidator;
        const data = await this.service.update(id, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Vendor updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        await this.service.delete(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Vendor deleted successfully',
            code: StatusCodes.OK,
        });
    };
}

export const vendorsController = new VendorsController(vendorsService);
