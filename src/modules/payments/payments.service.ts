import { ApiError } from '../../utils/error';
import { IPaymentsService, IPaymentsRepository, PaymentRow, PaymentSummary } from './interface/payments.interface';
import { CreatePaymentValidator, ListPaymentsValidator } from './validation/payments.validations';
import { paginate, PaginatedResult } from '../../utils/helpers/pagination.helper';
import paymentsRepository from './repository/payments.repository';
import expensesRepository from '../expenses/repository/expenses.repository';
import currenciesRepository from '../currencies/repository/currencies.repository';

export class PaymentsService implements IPaymentsService {
    constructor(private readonly repository: IPaymentsRepository) {}

    async list(userId: string, filters: ListPaymentsValidator): Promise<PaginatedResult<PaymentRow>> {
        const { rows, total } = await this.repository.findAll(userId, filters);
        return paginate(rows, filters.page, filters.limit, total);
    }

    async summary(userId: string, ceremonyId?: string): Promise<PaymentSummary> {
        return this.repository.getSummary(userId, ceremonyId);
    }

    async create(expenseId: string, userId: string, data: CreatePaymentValidator): Promise<PaymentRow> {
        const expense = await expensesRepository.findRawById(expenseId, userId);
        if (!expense) throw new ApiError(404, 'Expense not found');

        const userCurrency = await currenciesRepository.findById(userId, data.user_currency_id);
        if (!userCurrency) throw new ApiError(404, 'Currency wallet not found');

        const isSameCurrency = userCurrency.currency_code === expense.base_currency;
        let resolvedExchangeRate: number | null;
        let resolvedBaseAmount: number;

        if (isSameCurrency) {
            resolvedExchangeRate = null;
            resolvedBaseAmount = data.wallet_amount;
        } else {
            if (!data.exchange_rate) throw new ApiError(400, 'exchange_rate is required for foreign currency payments');
            if (!data.base_amount) throw new ApiError(400, 'base_amount is required for foreign currency payments');
            resolvedExchangeRate = data.exchange_rate;
            resolvedBaseAmount = data.base_amount;
        }

        return this.repository.create(expenseId, userId, data, resolvedBaseAmount, resolvedExchangeRate);
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
