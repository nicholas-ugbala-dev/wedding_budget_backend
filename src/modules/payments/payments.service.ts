import { ApiError } from '../../utils/error';
import { IPaymentsService, IPaymentsRepository, PaymentRow, PaymentSummary } from './interface/payments.interface';
import {
    CreatePaymentValidator,
    ListPaymentsValidator,
    UpdatePaymentValidator,
} from './validation/payments.validations';
import { paginate, PaginatedResult } from '../../utils/helpers/pagination.helper';
import paymentsRepository from './repository/payments.repository';
import expensesRepository from '../expenses/repository/expenses.repository';
import currenciesRepository from '../currencies/repository/currencies.repository';
import authRepository from '../auth/repository/auth.repository';
import clientsRepository from '../clients/repository/clients.repository';
import { getRate } from '../../utils/exchange-rate';
import { fromAmountInt } from '../../utils/money';

export class PaymentsService implements IPaymentsService {
    constructor(private readonly repository: IPaymentsRepository) {}

    async list(userId: string, filters: ListPaymentsValidator): Promise<PaginatedResult<PaymentRow>> {
        const { rows, total } = await this.repository.findAll(userId, filters);
        return paginate(rows, filters.page, filters.limit, total);
    }

    async summary(userId: string, eventId?: string, clientId?: string): Promise<PaymentSummary> {
        const raw = await this.repository.getSummary(userId, eventId, clientId);
        const user = await authRepository.findById(userId);
        const reportingCurrency = clientId
            ? ((await clientsRepository.findById(clientId, userId))?.currency_code ?? user!.base_currency)
            : user!.base_currency;
        return {
            ...raw,
            total_paid: fromAmountInt(raw.total_paid, reportingCurrency),
            outstanding: fromAmountInt(raw.outstanding, reportingCurrency),
        };
    }

    async create(expenseId: string, userId: string, data: CreatePaymentValidator): Promise<PaymentRow> {
        const expense = await expensesRepository.findRawById(expenseId, userId);
        if (!expense) throw new ApiError(404, 'Expense not found');

        let walletCurrencyCode: string;
        let resolvedExchangeRate: number | null;
        let resolvedBaseAmount: number;

        if (data.user_currency_id) {
            // Couple flow: look up wallet from user_currencies
            const userCurrency = await currenciesRepository.findById(userId, data.user_currency_id);
            if (!userCurrency) throw new ApiError(404, 'Currency wallet not found');
            walletCurrencyCode = userCurrency.currency_code;
        } else {
            // Planner flow: currency code provided directly
            walletCurrencyCode = data.wallet_currency_code!.toUpperCase();
        }

        const isSameCurrency = walletCurrencyCode === expense.base_currency;
        if (isSameCurrency) {
            resolvedExchangeRate = null;
            resolvedBaseAmount = data.wallet_amount;
        } else {
            if (!data.exchange_rate) throw new ApiError(400, 'exchange_rate is required for foreign currency payments');
            if (!data.base_amount) throw new ApiError(400, 'base_amount is required for foreign currency payments');
            resolvedExchangeRate = data.exchange_rate;
            resolvedBaseAmount = data.base_amount;
        }

        // Derive reporting_amount: convert base_amount to the user/client's reporting currency
        const user = await authRepository.findById(userId);
        const reportingCurrency = expense.client_id
            ? ((await clientsRepository.findById(expense.client_id, userId))?.currency_code ?? user!.base_currency)
            : user!.base_currency;

        let reportingAmount: number | null = null;
        let reportingCurrencyCode: string | null = null;

        if (expense.base_currency === reportingCurrency) {
            reportingAmount = resolvedBaseAmount;
            reportingCurrencyCode = reportingCurrency;
        } else if (walletCurrencyCode === reportingCurrency) {
            reportingAmount = data.wallet_amount;
            reportingCurrencyCode = reportingCurrency;
        } else {
            const liveRate = await getRate(expense.base_currency, reportingCurrency);
            if (liveRate != null) {
                reportingAmount = resolvedBaseAmount * liveRate;
                reportingCurrencyCode = reportingCurrency;
            }
        }

        return this.repository.create(
            expenseId,
            userId,
            data,
            walletCurrencyCode,
            expense.base_currency,
            resolvedBaseAmount,
            resolvedExchangeRate,
            reportingCurrencyCode,
            reportingAmount,
        );
    }

    async update(id: string, expenseId: string, userId: string, data: UpdatePaymentValidator): Promise<PaymentRow> {
        const expense = await expensesRepository.findRawById(expenseId, userId);
        if (!expense) throw new ApiError(404, 'Expense not found');

        const payment = await this.repository.findById(id, expenseId, userId);
        if (!payment) throw new ApiError(404, 'Payment not found');

        let walletCurrencyCode: string | undefined;

        if (data.user_currency_id !== undefined) {
            const userCurrency = await currenciesRepository.findById(userId, data.user_currency_id);
            if (!userCurrency) throw new ApiError(404, 'Currency wallet not found');
            walletCurrencyCode = userCurrency.currency_code;
            const isSameCurrency = walletCurrencyCode === expense.base_currency;
            if (!isSameCurrency && !data.exchange_rate && !data.base_amount) {
                throw new ApiError(
                    400,
                    'exchange_rate and base_amount are required when switching to a foreign currency wallet',
                );
            }
        } else if (data.wallet_currency_code !== undefined) {
            walletCurrencyCode = data.wallet_currency_code.toUpperCase();
            const isSameCurrency = walletCurrencyCode === expense.base_currency;
            if (!isSameCurrency && !data.exchange_rate && !data.base_amount) {
                throw new ApiError(400, 'exchange_rate and base_amount are required for foreign currency payments');
            }
        }

        // Recalculate reporting_amount if wallet currency or amount changes
        let reportingCurrencyCode: string | null | undefined = undefined;
        let reportingAmount: number | null | undefined = undefined;

        const amountOrCurrencyChanged =
            data.base_amount !== undefined || data.wallet_amount !== undefined || walletCurrencyCode !== undefined;

        if (amountOrCurrencyChanged) {
            const user = await authRepository.findById(userId);
            const reportingCurrency = expense.client_id
                ? ((await clientsRepository.findById(expense.client_id, userId))?.currency_code ?? user!.base_currency)
                : user!.base_currency;

            const effectiveBaseAmount = data.base_amount ?? Number(payment.base_amount);
            const effectiveWalletCode = walletCurrencyCode ?? payment.wallet_currency_code;
            const effectiveWalletAmount = data.wallet_amount ?? Number(payment.wallet_amount);

            if (expense.base_currency === reportingCurrency) {
                reportingAmount = effectiveBaseAmount;
                reportingCurrencyCode = reportingCurrency;
            } else if (effectiveWalletCode === reportingCurrency) {
                reportingAmount = effectiveWalletAmount;
                reportingCurrencyCode = reportingCurrency;
            } else {
                const liveRate = await getRate(expense.base_currency, reportingCurrency);
                if (liveRate != null) {
                    reportingAmount = effectiveBaseAmount * liveRate;
                    reportingCurrencyCode = reportingCurrency;
                }
            }
        }

        return this.repository.update(
            id,
            expenseId,
            userId,
            data,
            walletCurrencyCode,
            expense.base_currency,
            reportingCurrencyCode,
            reportingAmount,
        );
    }

    async delete(id: string, expenseId: string, userId: string): Promise<void> {
        const expense = await expensesRepository.findRawById(expenseId, userId);
        if (!expense) throw new ApiError(404, 'Expense not found');
        const payment = await this.repository.findById(id, expenseId, userId);
        if (!payment) throw new ApiError(404, 'Payment not found');
        await this.repository.softDelete(id, expenseId, userId);
    }
}

const paymentsService = new PaymentsService(paymentsRepository);
export default paymentsService;
