import { Router } from "express";
import { authRouter } from "../../modules/auth/auth.routes";
import { ceremoniesRouter } from "../../modules/ceremonies/ceremonies.routes";
import { currenciesRouter } from "../../modules/currencies/currencies.routes";
import { vendorsRouter } from "../../modules/vendors/vendors.routes";
import { categoriesRouter } from "../../modules/categories/categories.routes";
import { expensesRouter } from "../../modules/expenses/expenses.routes";
import { paymentsRouter } from "../../modules/payments/payments.routes";
import { dashboardRouter } from "../../modules/dashboard/dashboard.routes";

const router = Router();

router.use('/auth', authRouter);
router.use('/ceremonies', ceremoniesRouter);
router.use('/currencies', currenciesRouter);
router.use('/vendors', vendorsRouter);
router.use('/categories', categoriesRouter);
router.use('/expenses', expensesRouter);
router.use('/payments', paymentsRouter);
router.use('/dashboard', dashboardRouter);

export default router;