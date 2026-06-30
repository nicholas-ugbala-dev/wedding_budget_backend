import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { listPaymentsValidator, paymentsSummaryValidator } from './validation/payments.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/types', tryCatch(paymentsController.listTypes));
router.get('/summary', validateRequest(paymentsSummaryValidator), tryCatch(paymentsController.summary));
router.get('/', validateRequest(listPaymentsValidator), tryCatch(paymentsController.list));

export const paymentsRouter = router;
