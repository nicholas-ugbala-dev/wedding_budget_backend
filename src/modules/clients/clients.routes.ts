import { Router } from 'express';
import { clientsController } from './clients.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { createClientValidator, updateClientValidator } from './validation/clients.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/', tryCatch(clientsController.list));

router.post(
    '/',
    validateRequest(createClientValidator),
    tryCatch(clientsController.create),
);

router.patch(
    '/:id',
    validateRequest(updateClientValidator),
    tryCatch(clientsController.update),
);

router.delete('/:id', tryCatch(clientsController.delete));

export const clientsRouter = router;
