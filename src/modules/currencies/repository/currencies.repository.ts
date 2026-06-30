import { dbQuery } from '../../../config/database/helper/query.helpers';
import { ICurrenciesRepository, UserCurrency } from '../interface/currencies.interface';
import { AddCurrencyValidator } from '../validation/currencies.validations';
import CurrenciesQueries from '../query/currencies.queries';

const { findAll, findByCode, add, remove } = CurrenciesQueries;

export class CurrenciesRepository implements ICurrenciesRepository {
    async findAll(userId: string): Promise<UserCurrency[]> {
        return (await dbQuery.manyOrNone<UserCurrency>(findAll, [userId])) ?? [];
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
}

const currenciesRepository = new CurrenciesRepository();
export default currenciesRepository;
