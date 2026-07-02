import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { paymentsController } from '../payments/payments.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import {
    createExpenseValidator,
    updateExpenseValidator,
    listExpensesValidator,
} from './validation/expenses.validations';
import { createPaymentValidator, updatePaymentValidator } from '../payments/validation/payments.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get(
    '/',
    validateRequest(listExpensesValidator),
    tryCatch(expensesController.list),
);

router.post(
    '/',
    validateRequest(createExpenseValidator),
    tryCatch(expensesController.create),
);

router.get('/:id', tryCatch(expensesController.get));

router.patch(
    '/:id',
    validateRequest(updateExpenseValidator),
    tryCatch(expensesController.update),
);

router.delete('/:id', tryCatch(expensesController.delete));

router.post(
    '/:id/payments',
    validateRequest(createPaymentValidator),
    tryCatch(paymentsController.create),
);

router.patch(
    '/:id/payments/:paymentId',
    validateRequest(updatePaymentValidator),
    tryCatch(paymentsController.update),
);

router.delete('/:id/payments/:paymentId', tryCatch(paymentsController.delete));

export const expensesRouter = router;
