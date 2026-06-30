import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { getDashboardValidator } from './validation/dashboard.validation';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/', validateRequest(getDashboardValidator), tryCatch(dashboardController.get));

export const dashboardRouter = router;
