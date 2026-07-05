import { Router } from 'express';
import { settingsController } from './settings.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { updateProfileValidator } from '../auth/validation/auth.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.patch(
    '/account',
    tokenGuard,
    validateRequest(updateProfileValidator),
    tryCatch(settingsController.updateProfile),
);

export const settingsRouter = router;
