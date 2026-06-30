import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import {
    createCategoryValidator,
    updateCategoryValidator,
    listCategoriesValidator,
} from './validation/categories.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get(
    '/',
    validateRequest(listCategoriesValidator),
    tryCatch(categoriesController.list),
);

router.post(
    '/',
    validateRequest(createCategoryValidator),
    tryCatch(categoriesController.create),
);

router.patch(
    '/:id',
    validateRequest(updateCategoryValidator),
    tryCatch(categoriesController.update),
);

router.delete('/:id', tryCatch(categoriesController.delete));

export const categoriesRouter = router;
