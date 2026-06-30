import { Router } from 'express';
import { ceremoniesController } from './ceremonies.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { createCeremonyValidator, updateCeremonyValidator } from './validation/ceremonies.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/', tryCatch(ceremoniesController.list));

router.post(
    '/',
    validateRequest(createCeremonyValidator),
    tryCatch(ceremoniesController.create),
);

router.patch(
    '/:id',
    validateRequest(updateCeremonyValidator),
    tryCatch(ceremoniesController.update),
);

router.delete('/:id', tryCatch(ceremoniesController.delete));

export const ceremoniesRouter = router;
