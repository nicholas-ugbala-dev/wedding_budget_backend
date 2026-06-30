import { ApiError } from '../../utils/error';
import { IExpensesService, IExpensesRepository, ExpenseRow, ExpenseDetail } from './interface/expenses.interface';
import { CreateExpenseValidator, UpdateExpenseValidator, ListExpensesValidator } from './validation/expenses.validations';
import { paginate, PaginatedResult } from '../../utils/helpers/pagination.helper';
import expensesRepository from './repository/expenses.repository';
import vendorsRepository from '../vendors/repository/vendors.repository';
import categoriesRepository from '../categories/repository/categories.repository';
import ceremoniesRepository from '../ceremonies/repository/ceremonies.repository';
import currenciesRepository from '../currencies/repository/currencies.repository';

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
        const ceremony = await ceremoniesRepository.findById(data.ceremony_id, userId);
        if (!ceremony) throw new ApiError(404, 'Ceremony not found');

        // Validate base_currency is in user's configured currencies (if explicitly provided)
        if (data.base_currency) {
            const currency = await currenciesRepository.findByCode(userId, data.base_currency);
            if (!currency) throw new ApiError(400, 'Currency not configured for this account');
        }

        // Resolve category — prefer explicit id, otherwise findOrCreate by name+ceremony_id
        let categoryId: string;
        if (data.category_id) {
            const cat = await categoriesRepository.findById(data.category_id, userId);
            if (!cat) throw new ApiError(404, 'Category not found');
            categoryId = cat.id;
        } else {
            const cat = await categoriesRepository.findOrCreate(userId, {
                name: data.category_name!,
                ceremony_id: data.ceremony_id,
            });
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

        return this.repository.create(userId, data, categoryId, vendorId);
    }

    async update(id: string, userId: string, data: UpdateExpenseValidator): Promise<ExpenseRow> {
        const existing = await this.repository.findRawById(id, userId);
        if (!existing) throw new ApiError(404, 'Expense not found');

        // Validate new ceremony belongs to user if changing it
        if (data.ceremony_id) {
            const ceremony = await ceremoniesRepository.findById(data.ceremony_id, userId);
            if (!ceremony) throw new ApiError(404, 'Ceremony not found');
        }

        return this.repository.update(id, userId, data, existing);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findRawById(id, userId);
        if (!existing) throw new ApiError(404, 'Expense not found');
        await this.repository.delete(id, userId);
    }
}

const expensesService = new ExpensesService(expensesRepository);
export default expensesService;
