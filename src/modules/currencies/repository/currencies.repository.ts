import { dbQuery } from '../../../config/database/helper/query.helpers';
import { ICurrenciesRepository, UserCurrency, ClientCurrency } from '../interface/currencies.interface';
import { AddCurrencyValidator } from '../validation/currencies.validations';
import CurrenciesQueries from '../query/currencies.queries';

const {
    findAll, findById, findByCode, add, remove, upsertUserCurrency,
    findByClientId, upsertClientCurrency, insertClientBaseWallet, deleteClientCurrencies,
} = CurrenciesQueries;

export class CurrenciesRepository implements ICurrenciesRepository {
    async findAll(userId: string): Promise<UserCurrency[]> {
        return (await dbQuery.manyOrNone<UserCurrency>(findAll, [userId])) ?? [];
    }

    async findById(userId: string, id: string): Promise<UserCurrency | null> {
        return dbQuery.oneOrNone<UserCurrency>(findById, [userId, id]);
    }

    async findByCode(userId: string, currencyCode: string): Promise<UserCurrency | null> {
        return dbQuery.oneOrNone<UserCurrency>(findByCode, [userId, currencyCode]);
    }

    async add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency> {
        return dbQuery.one<UserCurrency>(add, [userId, data.currency_code]);
    }

    async remove(userId: string, currencyCode: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [userId, currencyCode]);
    }

    async findByClientId(clientId: string, userId: string): Promise<ClientCurrency[]> {
        return (await dbQuery.manyOrNone<ClientCurrency>(findByClientId, [clientId, userId])) ?? [];
    }

    async upsertUserCurrency(userId: string, currencyCode: string): Promise<void> {
        await dbQuery.manyOrNone(upsertUserCurrency, [userId, currencyCode.toUpperCase()]);
    }

    async upsertClientCurrency(clientId: string, currencyCode: string): Promise<void> {
        await dbQuery.manyOrNone(upsertClientCurrency, [clientId, currencyCode.toUpperCase()]);
    }

    async insertClientBaseWallet(clientId: string, currencyCode: string): Promise<void> {
        await dbQuery.manyOrNone(insertClientBaseWallet, [clientId, currencyCode.toUpperCase()]);
    }

    async setClientCurrencies(clientId: string, codes: string[]): Promise<void> {
        await dbQuery.manyOrNone(deleteClientCurrencies, [clientId]);
        for (const code of codes) {
            await dbQuery.manyOrNone(upsertClientCurrency, [clientId, code.toUpperCase()]);
        }
    }
}

const currenciesRepository = new CurrenciesRepository();
export default currenciesRepository;
