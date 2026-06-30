import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { IDashboardService } from './interface/dashboard.interface';
import { GetDashboardValidator } from './validation/dashboard.validation';
import dashboardService from './dashboard.service';

export class DashboardController {
    constructor(private readonly service: IDashboardService) {}

    get = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const { ceremony_id } = req.query as unknown as GetDashboardValidator;
        const data = await this.service.getDashboard(userId, ceremony_id);

        new ResponseHandler(req, res).success({
            message: 'Dashboard fetched successfully',
            code: StatusCodes.OK,
            data,
        });
    };
}

export const dashboardController = new DashboardController(dashboardService);
