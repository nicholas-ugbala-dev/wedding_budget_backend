import { Router } from 'express';
import { vendorsController } from './vendors.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import {
    createVendorValidator,
    updateVendorValidator,
    listVendorsValidator,
} from './validation/vendors.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get(
    '/',
    validateRequest(listVendorsValidator),
    tryCatch(vendorsController.list),
);

router.post(
    '/',
    validateRequest(createVendorValidator),
    tryCatch(vendorsController.create),
);

router.patch(
    '/:id',
    validateRequest(updateVendorValidator),
    tryCatch(vendorsController.update),
);

router.delete('/:id', tryCatch(vendorsController.delete));

export const vendorsRouter = router;
