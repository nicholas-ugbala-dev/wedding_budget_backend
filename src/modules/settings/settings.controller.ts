import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../utils/helpers/response.handler';
import { UpdateProfileValidator } from '../auth/validation/auth.validations';
import authService from '../auth/auth.service';

export class SettingsController {
    updateProfile = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user?.id as string;
        const body = req.body as UpdateProfileValidator;
        const data = await authService.updateProfile(userId, body);

        new ResponseHandler(req, res).success({
            message: 'Profile updated successfully',
            code: StatusCodes.OK,
            data,
        });
    };
}

export const settingsController = new SettingsController();
