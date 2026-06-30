import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { ICeremoniesService } from './interface/ceremonies.interface';
import { CreateCeremonyValidator, UpdateCeremonyValidator } from './validation/ceremonies.validations';
import ceremoniesService from './ceremonies.service';

export class CeremoniesController {
    constructor(private readonly service: ICeremoniesService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const data = await this.service.list(userId);

        new ResponseHandler(req, res).success({
            message: 'Ceremonies fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as CreateCeremonyValidator;
        const data = await this.service.create(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Ceremony created successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const body = req.body as UpdateCeremonyValidator;
        const data = await this.service.update(id, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Ceremony updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        await this.service.delete(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Ceremony removed successfully',
            code: StatusCodes.OK,
        });
    };
}

export const ceremoniesController = new CeremoniesController(ceremoniesService);
