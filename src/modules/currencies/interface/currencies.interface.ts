import { AddCurrencyValidator } from '../validation/currencies.validations';

export interface UserCurrency {
    id: string;
    user_id: string;
    currency_code: string;
    created_at: Date;
}

export interface ICurrenciesRepository {
    findAll(userId: string): Promise<UserCurrency[]>;
    findByCode(userId: string, currencyCode: string): Promise<UserCurrency | null>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
}

export interface ICurrenciesService {
    list(userId: string): Promise<UserCurrency[]>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
}
