import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import {
    createExpenseValidator,
    updateExpenseValidator,
    listExpensesValidator,
} from './validation/expenses.validations';

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

export const expensesRouter = router;
