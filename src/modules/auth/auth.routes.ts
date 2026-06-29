import { Router } from 'express';
import { authController } from './auth.controller';
import { ValidationMiddleware } from '../../middleware/validation.middleware';
import { tokenGuard } from '../../middleware/auth.middleware';
import { tryCatch } from '../../utils/error';
import {
  registerValidator,
  loginValidator,
  onboardingValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
} from './validation/auth.validations';

const { validateRequest } = ValidationMiddleware;

const router = Router();

router.post(
  '/register',
  validateRequest(registerValidator),
  tryCatch(authController.register),
);

router.post(
  '/login',
  validateRequest(loginValidator),
  tryCatch(authController.login),
);

router.get(
  '/me',
  tokenGuard,
  tryCatch(authController.me),
);

router.patch(
  '/onboarding',
  tokenGuard,
  validateRequest(onboardingValidator),
  tryCatch(authController.updateOnboarding),
);

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordValidator),
  tryCatch(authController.forgotPassword),
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordValidator),
  tryCatch(authController.resetPassword)
)

export const authRouter = router;