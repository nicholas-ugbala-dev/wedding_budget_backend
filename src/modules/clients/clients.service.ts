import { ApiError } from '../../utils/error';
import { IClientsService, IClientsRepository, Client } from './interface/clients.interface';
import { CreateClientValidator, UpdateClientValidator } from './validation/clients.validations';
import clientsRepository from './repository/clients.repository';

export class ClientsService implements IClientsService {
    constructor(private readonly repository: IClientsRepository) {}

    async list(userId: string): Promise<Client[]> {
        return this.repository.findAll(userId);
    }

    async create(userId: string, data: CreateClientValidator): Promise<Client> {
        return this.repository.create(userId, data);
    }

    async update(id: string, userId: string, data: UpdateClientValidator): Promise<Client> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Client not found');
        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Client not found');
        await this.repository.delete(id, userId);
    }
}

const clientsService = new ClientsService(clientsRepository);
export default clientsService;
