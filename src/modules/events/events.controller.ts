import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { IEventsService } from './interface/events.interface';
import { CreateEventValidator, UpdateEventValidator } from './validation/events.validations';
import eventsService from './events.service';

export class EventsController {
    constructor(private readonly service: IEventsService) {}

    list = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const data = await this.service.list(userId);

        new ResponseHandler(req, res).success({
            message: 'Events fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as CreateEventValidator;
        const data = await this.service.create(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Event created successfully',
            code: StatusCodes.CREATED,
            data,
        });
    };

    update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        const body = req.body as UpdateEventValidator;
        const data = await this.service.update(id, userId, body);

        new ResponseHandler(req, res).success({
            message: 'Event updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };

    delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { id } = req.params;
        await this.service.delete(id, userId);

        new ResponseHandler(req, res).success({
            message: 'Event removed successfully',
            code: StatusCodes.OK,
        });
    };
}

export const eventsController = new EventsController(eventsService);
