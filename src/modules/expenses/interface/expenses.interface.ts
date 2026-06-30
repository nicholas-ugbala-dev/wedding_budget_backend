import { Payment } from '../../../config/database/models';
import { CreateExpenseValidator, UpdateExpenseValidator, ListExpensesValidator } from '../validation/expenses.validations';
import { PaginatedResult } from '../../../utils/helpers/pagination.helper';

export type ExpenseStatus = 'unpaid' | 'partial' | 'paid';

export interface ExpenseRow {
    id: string;
    user_id: string;
    name: string;
    ceremony_id: string;
    ceremony_name: string;
    category_id: string;
    category_name: string;
    vendor_id: string | null;
    vendor_name: string | null;
    planned_amount: number | null;
    actual_amount: number | null;
    base_currency: string;
    refundable_amount: number;
    is_refunded: boolean;
    refunded_at: Date | null;
    notes: string | null;
    is_planned: boolean;
    total_paid: number;
    balance: number;
    status: ExpenseStatus;
    created_at: Date;
    updated_at: Date;
}

export interface ExpenseDetail extends ExpenseRow {
    payments: Payment[];
}

export interface IExpensesRepository {
    findAll(userId: string, filters: ListExpensesValidator): Promise<{ rows: ExpenseRow[]; total: number }>;
    findById(id: string, userId: string): Promise<ExpenseDetail | null>;
    findRawById(id: string, userId: string): Promise<ExpenseRow | null>;
    create(
        userId: string,
        data: CreateExpenseValidator,
        resolvedCategoryId: string,
        resolvedVendorId: string | null,
    ): Promise<ExpenseRow>;
    update(id: string, userId: string, data: UpdateExpenseValidator, existing: ExpenseRow): Promise<ExpenseRow>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IExpensesService {
    list(userId: string, filters: ListExpensesValidator): Promise<PaginatedResult<ExpenseRow>>;
    get(id: string, userId: string): Promise<ExpenseDetail>;
    create(userId: string, data: CreateExpenseValidator): Promise<ExpenseRow>;
    update(id: string, userId: string, data: UpdateExpenseValidator): Promise<ExpenseRow>;
    delete(id: string, userId: string): Promise<void>;
}
