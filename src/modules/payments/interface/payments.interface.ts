import { Payment } from '../../../config/database/models';
import {
    CreatePaymentValidator,
    ListPaymentsValidator,
    UpdatePaymentValidator,
} from '../validation/payments.validations';
import { PaginatedResult } from '../../../utils/helpers/pagination.helper';

export interface PaymentRow extends Omit<Payment, 'deleted_at'> {
    wallet_currency_code: string;
    expense_name: string;
    event_id: string;
    event_name: string;
    expense_base_currency: string;
    reporting_currency_code: string | null;
    reporting_amount: number | null;
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
    getSummary(userId: string, eventId?: string, clientId?: string): Promise<PaymentSummary>;
    create(
        expenseId: string,
        userId: string,
        data: CreatePaymentValidator,
        walletCurrencyCode: string,
        expenseBaseCurrency: string,
        resolvedBaseAmount: number,
        resolvedExchangeRate: number | null,
        reportingCurrencyCode: string | null,
        reportingAmount: number | null,
    ): Promise<PaymentRow>;
    update(
        id: string,
        expenseId: string,
        userId: string,
        data: UpdatePaymentValidator,
        walletCurrencyCode?: string,
        expenseBaseCurrency?: string,
        reportingCurrencyCode?: string | null,
        reportingAmount?: number | null,
    ): Promise<PaymentRow>;
    softDelete(id: string, expenseId: string, userId: string): Promise<void>;
}

export interface IPaymentsService {
    list(userId: string, filters: ListPaymentsValidator): Promise<PaginatedResult<PaymentRow>>;
    summary(userId: string, eventId?: string, clientId?: string): Promise<PaymentSummary>;
    create(expenseId: string, userId: string, data: CreatePaymentValidator): Promise<PaymentRow>;
    update(id: string, expenseId: string, userId: string, data: UpdatePaymentValidator): Promise<PaymentRow>;
    delete(id: string, expenseId: string, userId: string): Promise<void>;
}
