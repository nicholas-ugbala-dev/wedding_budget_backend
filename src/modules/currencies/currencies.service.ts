import { ApiError } from '../../utils/error';
import { ICurrenciesService, ICurrenciesRepository, UserCurrency } from './interface/currencies.interface';
import { AddCurrencyValidator } from './validation/currencies.validations';
import currenciesRepository from './repository/currencies.repository';

export class CurrenciesService implements ICurrenciesService {
    constructor(private readonly repository: ICurrenciesRepository) {}

    async list(userId: string): Promise<UserCurrency[]> {
        return this.repository.findAll(userId);
    }

    async add(userId: string, data: AddCurrencyValidator): Promise<UserCurrency> {
        const existing = await this.repository.findByCode(userId, data.currency_code);
        if (existing) {
            throw new ApiError(409, `${data.currency_code} wallet already exists`);
        }
        return this.repository.add(userId, data);
    }

    async remove(userId: string, currencyCode: string): Promise<void> {
        const existing = await this.repository.findByCode(userId, currencyCode.toUpperCase());
        if (!existing) {
            throw new ApiError(404, `${currencyCode} wallet not found`);
        }
        await this.repository.remove(userId, currencyCode.toUpperCase());
    }
}

const currenciesService = new CurrenciesService(currenciesRepository);
export default currenciesService;
