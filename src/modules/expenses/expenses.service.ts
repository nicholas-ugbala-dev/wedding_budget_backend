import { ApiError } from '../../utils/error';
import { IExpensesService, IExpensesRepository, ExpenseRow, ExpenseDetail } from './interface/expenses.interface';
import { CreateExpenseValidator, UpdateExpenseValidator, ListExpensesValidator } from './validation/expenses.validations';
import { paginate, PaginatedResult } from '../../utils/helpers/pagination.helper';
import expensesRepository from './repository/expenses.repository';
import vendorsRepository from '../vendors/repository/vendors.repository';
import categoriesRepository from '../categories/repository/categories.repository';
import eventsRepository from '../events/repository/events.repository';
import clientsRepository from '../clients/repository/clients.repository';
import currenciesRepository from '../currencies/repository/currencies.repository';
import authRepository from '../auth/repository/auth.repository';
import { getRate } from '../../utils/exchange-rate';

export class ExpensesService implements IExpensesService {
    constructor(private readonly repository: IExpensesRepository) {}

    async list(userId: string, filters: ListExpensesValidator): Promise<PaginatedResult<ExpenseRow>> {
        const { rows, total } = await this.repository.findAll(userId, filters);
        return paginate(rows, filters.page, filters.limit, total);
    }

    async get(id: string, userId: string): Promise<ExpenseDetail> {
        const expense = await this.repository.findById(id, userId);
        if (!expense) throw new ApiError(404, 'Expense not found');
        return expense;
    }

    async create(userId: string, data: CreateExpenseValidator): Promise<ExpenseRow> {
        // Validate ceremony belongs to user
        const event = await eventsRepository.findById(data.event_id, userId);
        if (!event) throw new ApiError(404, 'Event not found');

        // Derive base_currency: vendor currency (stable) → client fallback → DB default 'NGN'
        if (!data.base_currency) {
            if (event.vendor_currency) {
                (data as Record<string, unknown>).base_currency = event.vendor_currency;
            } else if (event.client_id) {
                const client = await clientsRepository.findById(event.client_id, userId);
                if (client) (data as Record<string, unknown>).base_currency = client.currency_code;
            }
        }

        // Resolve category — prefer explicit id, otherwise findOrCreate by name
        let categoryId: string;
        if (data.category_id) {
            const cat = await categoriesRepository.findById(data.category_id, userId);
            if (!cat) throw new ApiError(404, 'Category not found');
            categoryId = cat.id;
        } else {
            const cat = await categoriesRepository.findOrCreate(userId, data.category_name!);
            categoryId = cat.id;
        }

        // Resolve vendor — prefer explicit id, otherwise findOrCreate by name if provided
        let vendorId: string | null = null;
        if (data.vendor_id) {
            const vendor = await vendorsRepository.findById(data.vendor_id, userId);
            if (!vendor) throw new ApiError(404, 'Vendor not found');
            vendorId = vendor.id;
        } else if (data.vendor_name) {
            const vendor = await vendorsRepository.findOrCreate(userId, {
                name: data.vendor_name,
                phone: data.vendor_phone,
                email: data.vendor_email,
            });
            vendorId = vendor.id;
        }

        // Derive reporting_amount for actual_amount
        let reportingCurrencyCode: string | null = null;
        let reportingAmount: number | null = null;

        if (data.actual_amount != null) {
            const user = await authRepository.findById(userId);
            const reportingCurrency = event.client_id
                ? (await clientsRepository.findById(event.client_id, userId))?.currency_code ?? user!.base_currency
                : user!.base_currency;

            const baseCurrency = (data.base_currency as string | undefined) ?? event.vendor_currency ?? 'NGN';

            if (baseCurrency === reportingCurrency) {
                reportingAmount = data.actual_amount;
                reportingCurrencyCode = reportingCurrency;
            } else {
                const liveRate = await getRate(baseCurrency, reportingCurrency);
                if (liveRate != null) {
                    reportingAmount = Math.round(data.actual_amount * liveRate);
                    reportingCurrencyCode = reportingCurrency;
                }
            }
        }

        return this.repository.create(userId, data, categoryId, vendorId, reportingCurrencyCode, reportingAmount);
    }

    async update(id: string, userId: string, data: UpdateExpenseValidator): Promise<ExpenseRow> {
        const existing = await this.repository.findRawById(id, userId);
        if (!existing) throw new ApiError(404, 'Expense not found');

        // Validate new ceremony belongs to user if changing it
        if (data.event_id) {
            const event = await eventsRepository.findById(data.event_id, userId);
            if (!event) throw new ApiError(404, 'Event not found');
        }

        // Recalculate reporting_amount when actual_amount changes
        let reportingCurrencyCode: string | null | undefined = undefined;
        let reportingAmount: number | null | undefined = undefined;

        if ('actual_amount' in data) {
            const newActualAmount = data.actual_amount ?? null;
            if (newActualAmount != null) {
                const user = await authRepository.findById(userId);
                const reportingCurrency = existing.client_id
                    ? (await clientsRepository.findById(existing.client_id, userId))?.currency_code ?? user!.base_currency
                    : user!.base_currency;

                if (existing.base_currency === reportingCurrency) {
                    reportingAmount = newActualAmount;
                    reportingCurrencyCode = reportingCurrency;
                } else {
                    const liveRate = await getRate(existing.base_currency, reportingCurrency);
                    if (liveRate != null) {
                        reportingAmount = Math.round(newActualAmount * liveRate);
                        reportingCurrencyCode = reportingCurrency;
                    }
                }
            } else {
                reportingAmount = null;
                reportingCurrencyCode = null;
            }
        }

        return this.repository.update(id, userId, data, existing, reportingCurrencyCode, reportingAmount);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findRawById(id, userId);
        if (!existing) throw new ApiError(404, 'Expense not found');
        await this.repository.delete(id, userId);
    }
}

const expensesService = new ExpensesService(expensesRepository);
export default expensesService;
