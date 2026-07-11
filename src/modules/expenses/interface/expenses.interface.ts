import type { PoolClient } from 'pg';
import {
    CreateExpenseValidator,
    UpdateExpenseValidator,
    ListExpensesValidator,
} from '../validation/expenses.validations';
import { PaginatedResult } from '../../../utils/helpers/pagination.helper';

export type ExpenseStatus = 'unpaid' | 'partial' | 'paid';

export interface ExpenseRow {
    id: string;
    user_id: string;
    name: string;
    event_id: string;
    event_name: string;
    client_id: string | null;
    category_id: string;
    category_name: string;
    vendor_id: string | null;
    vendor_name: string | null;
    planned_amount: number | null;
    actual_amount: number | null;
    base_currency: string;
    reporting_currency_code: string | null;
    reporting_amount: number | null;
    refundable_amount: number;
    is_refunded: boolean;
    refunded_at: Date | null;
    notes: string | null;
    is_planned: boolean;
    payment_deadline: Date | null;
    total_paid: number;
    balance: number;
    status: ExpenseStatus;
    created_at: Date;
    updated_at: Date;
}

// Shape of each payment as returned by the JSON aggregate in the findById query
export interface EmbeddedPayment {
    id: string;
    expense_id: string;
    payment_type: string;
    user_currency_id: string | null;
    wallet_currency_code: string;
    wallet_amount: number;
    exchange_rate: number | null;
    base_amount: number;
    reporting_currency_code: string | null;
    reporting_amount: number | null;
    payment_date: Date;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ExpenseDetail extends ExpenseRow {
    payments: EmbeddedPayment[];
}

export interface IExpensesRepository {
    findAll(userId: string, filters: ListExpensesValidator): Promise<{ rows: ExpenseRow[]; total: number }>;
    findById(id: string, userId: string): Promise<ExpenseDetail | null>;
    findRawById(id: string, userId: string, client?: PoolClient): Promise<ExpenseRow | null>;
    create(
        userId: string,
        data: CreateExpenseValidator,
        resolvedCategoryId: string,
        resolvedVendorId: string | null,
        reportingCurrencyCode: string | null,
        reportingAmount: number | null,
        client?: PoolClient,
    ): Promise<ExpenseRow>;
    update(
        id: string,
        userId: string,
        data: UpdateExpenseValidator,
        existing: ExpenseRow,
        reportingCurrencyCode: string | null | undefined,
        reportingAmount: number | null | undefined,
        client?: PoolClient,
    ): Promise<ExpenseRow>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IExpensesService {
    list(userId: string, filters: ListExpensesValidator): Promise<PaginatedResult<ExpenseRow>>;
    get(id: string, userId: string): Promise<ExpenseDetail>;
    create(userId: string, data: CreateExpenseValidator): Promise<ExpenseRow>;
    update(id: string, userId: string, data: UpdateExpenseValidator): Promise<ExpenseRow>;
    delete(id: string, userId: string): Promise<void>;
}
