import { AddCurrencyValidator } from '../validation/currencies.validations';

export interface UserCurrency {
    id: string;
    user_id: string;
    currency_code: string;
    created_at: Date;
}

export interface ClientCurrency {
    id: string;         // = currency_code (used as select value on frontend)
    currency_code: string;
    is_base: boolean;
}

export interface ICurrenciesRepository {
    findAll(userId: string): Promise<UserCurrency[]>;
    findById(userId: string, id: string): Promise<UserCurrency | null>;
    findByCode(userId: string, currencyCode: string): Promise<UserCurrency | null>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
    findByClientId(clientId: string, userId: string): Promise<ClientCurrency[]>;
    upsertClientCurrency(clientId: string, currencyCode: string): Promise<void>;
    setClientCurrencies(clientId: string, codes: string[]): Promise<void>;
}

export interface ICurrenciesService {
    list(userId: string): Promise<UserCurrency[]>;
    listForClient(userId: string, clientId: string): Promise<ClientCurrency[]>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
    upsertClientCurrency(clientId: string, currencyCode: string): Promise<void>;
    setClientCurrencies(clientId: string, codes: string[]): Promise<void>;
}
