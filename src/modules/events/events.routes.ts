import { Router } from 'express';
import { eventsController } from './events.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import { createEventValidator, updateEventValidator } from './validation/events.validations';

const { validateRequest } = ValidationMiddleware;
const router = Router();

router.use(tokenGuard);

router.get('/', tryCatch(eventsController.list));

router.post('/', validateRequest(createEventValidator), tryCatch(eventsController.create));

router.patch('/:id', validateRequest(updateEventValidator), tryCatch(eventsController.update));

router.delete('/:id', tryCatch(eventsController.delete));

export const eventsRouter = router;
