import { Payment } from '../../../config/database/models';
import { CreatePaymentValidator, ListPaymentsValidator, UpdatePaymentValidator } from '../validation/payments.validations';
import { PaginatedResult } from '../../../utils/helpers/pagination.helper';

export interface PaymentRow extends Omit<Payment, 'deleted_at'> {
    wallet_currency_code: string;
    expense_name: string;
    ceremony_id: string;
    ceremony_name: string;
}

export interface PaymentSummary {
    total_paid: number;
    outstanding: number;
    fully_paid_count: number;
    total_expenses: number;
}

export interface IPaymentsRepository {
    findAll(userId: string, filters: ListPaymentsValidator): Promise<{ rows: PaymentRow[]; total: number }>;
    findById(id: string, expenseId: string, userId: string): Promise<PaymentRow | null>;
    getSummary(userId: string, ceremonyId?: string): Promise<PaymentSummary>;
    create(expenseId: string, userId: string, data: CreatePaymentValidator, resolvedBaseAmount: number, resolvedExchangeRate: number | null): Promise<PaymentRow>;
    update(id: string, expenseId: string, userId: string, data: UpdatePaymentValidator): Promise<PaymentRow>;
    softDelete(id: string, expenseId: string, userId: string): Promise<void>;
}

export interface IPaymentsService {
    list(userId: string, filters: ListPaymentsValidator): Promise<PaginatedResult<PaymentRow>>;
    summary(userId: string, ceremonyId?: string): Promise<PaymentSummary>;
    create(expenseId: string, userId: string, data: CreatePaymentValidator): Promise<PaymentRow>;
    update(id: string, expenseId: string, userId: string, data: UpdatePaymentValidator): Promise<PaymentRow>;
    delete(id: string, expenseId: string, userId: string): Promise<void>;
}
