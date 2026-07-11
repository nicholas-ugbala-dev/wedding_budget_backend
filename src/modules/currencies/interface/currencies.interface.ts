import type { PoolClient } from 'pg';
import { AddCurrencyValidator } from '../validation/currencies.validations';

export interface UserCurrency {
    id: string;
    user_id: string;
    currency_code: string;
    is_base: boolean;
    created_at: Date;
}

export interface ClientCurrency {
    id: string;
    user_id: string; // = client_id
    currency_code: string;
    is_base: boolean;
    created_at: Date;
}

export interface ICurrenciesRepository {
    findAll(userId: string): Promise<UserCurrency[]>;
    findById(userId: string, id: string): Promise<UserCurrency | null>;
    findByCode(userId: string, currencyCode: string): Promise<UserCurrency | null>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
    upsertUserCurrency(userId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    findByClientId(clientId: string, userId: string): Promise<ClientCurrency[]>;
    upsertClientCurrency(clientId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    insertClientBaseWallet(clientId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    setClientCurrencies(clientId: string, codes: string[], client?: PoolClient): Promise<void>;
}

export interface ICurrenciesService {
    list(userId: string): Promise<UserCurrency[]>;
    listForClient(userId: string, clientId: string): Promise<ClientCurrency[]>;
    add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency>;
    remove(userId: string, currencyCode: string): Promise<void>;
    upsertUserCurrency(userId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    upsertClientCurrency(clientId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    insertClientBaseWallet(clientId: string, currencyCode: string, client?: PoolClient): Promise<void>;
    setClientCurrencies(clientId: string, codes: string[], client?: PoolClient): Promise<void>;
}
