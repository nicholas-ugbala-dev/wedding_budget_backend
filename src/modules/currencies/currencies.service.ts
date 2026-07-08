import { ApiError } from '../../utils/error';
import { ICurrenciesService, ICurrenciesRepository, UserCurrency, ClientCurrency } from './interface/currencies.interface';
import { AddCurrencyValidator } from './validation/currencies.validations';
import currenciesRepository from './repository/currencies.repository';
import clientsRepository from '../clients/repository/clients.repository';

export class CurrenciesService implements ICurrenciesService {
    constructor(private readonly repository: ICurrenciesRepository) {}

    async list(userId: string): Promise<UserCurrency[]> {
        return this.repository.findAll(userId);
    }

    async listForClient(userId: string, clientId: string): Promise<ClientCurrency[]> {
        const client = await clientsRepository.findById(clientId, userId);
        if (!client) throw new ApiError(403, 'Client not found or access denied');
        return this.repository.findByClientId(clientId, userId);
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

    async upsertUserCurrency(userId: string, currencyCode: string): Promise<void> {
        return this.repository.upsertUserCurrency(userId, currencyCode);
    }

    async upsertClientCurrency(clientId: string, currencyCode: string): Promise<void> {
        return this.repository.upsertClientCurrency(clientId, currencyCode);
    }

    async insertClientBaseWallet(clientId: string, currencyCode: string): Promise<void> {
        return this.repository.insertClientBaseWallet(clientId, currencyCode);
    }

    async setClientCurrencies(clientId: string, codes: string[]): Promise<void> {
        return this.repository.setClientCurrencies(clientId, codes);
    }
}

const currenciesService = new CurrenciesService(currenciesRepository);
export default currenciesService;
