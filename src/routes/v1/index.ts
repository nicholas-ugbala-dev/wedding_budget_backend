import { Router } from "express";
import { authRouter } from "../../modules/auth/auth.routes";
import { ceremoniesRouter } from "../../modules/ceremonies/ceremonies.routes";
import { currenciesRouter } from "../../modules/currencies/currencies.routes";

const router = Router();

router.use('/auth', authRouter);
router.use('/ceremonies', ceremoniesRouter);
router.use('/currencies', currenciesRouter);

export default router;