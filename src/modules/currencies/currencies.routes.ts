import { Router } from 'express';
import { currenciesController } from './currencies.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { addCurrencyValidator } from './validation/currencies.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/', tryCatch(currenciesController.list));

router.post(
    '/',
    validateRequest(addCurrencyValidator),
    tryCatch(currenciesController.add),
);

router.delete('/:code', tryCatch(currenciesController.remove));

export const currenciesRouter = router;
