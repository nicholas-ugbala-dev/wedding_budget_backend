import { ApiError } from '../../utils/error';
import { IClientsService, IClientsRepository, Client } from './interface/clients.interface';
import { CreateClientValidator, UpdateClientValidator, ListClientsValidator } from './validation/clients.validations';
import { paginate, PaginatedResult } from '../../utils/helpers/pagination.helper';
import clientsRepository from './repository/clients.repository';
import currenciesService from '../currencies/currencies.service';

export class ClientsService implements IClientsService {
    constructor(private readonly repository: IClientsRepository) {}

    async list(userId: string, filters: ListClientsValidator): Promise<PaginatedResult<Client>> {
        const { rows, total } = await this.repository.findAll(userId, filters);
        return paginate(rows, filters.page, filters.limit, total);
    }

    async create(userId: string, data: CreateClientValidator): Promise<Client> {
        const client = await this.repository.create(userId, data);
        await currenciesService.insertClientBaseWallet(client.id, data.currency_code);
        if (data.extra_currencies?.length) {
            await currenciesService.setClientCurrencies(client.id, data.extra_currencies);
        }
        return client;
    }

    async update(id: string, userId: string, data: UpdateClientValidator): Promise<Client> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Client not found');
        const client = await this.repository.update(id, userId, data);
        if (data.currency_code) {
            await currenciesService.insertClientBaseWallet(id, data.currency_code);
        }
        if (data.extra_currencies !== undefined) {
            await currenciesService.setClientCurrencies(id, data.extra_currencies);
        }
        return client;
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Client not found');
        await this.repository.delete(id, userId);
    }
}

const clientsService = new ClientsService(clientsRepository);
export default clientsService;
