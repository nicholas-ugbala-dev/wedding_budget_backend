import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IClientsRepository, Client } from '../interface/clients.interface';
import { CreateClientValidator, UpdateClientValidator } from '../validation/clients.validations';
import ClientsQueries from '../query/clients.queries';

const { findAll, findById, create, update, remove } = ClientsQueries;

export class ClientsRepository implements IClientsRepository {
    async findAll(userId: string): Promise<Client[]> {
        return dbQuery.manyOrNone<Client>(findAll, [userId]) as Promise<Client[]>;
    }

    async findById(id: string, userId: string): Promise<Client | null> {
        return dbQuery.oneOrNone<Client>(findById, [id, userId]);
    }

    async create(userId: string, data: CreateClientValidator): Promise<Client> {
        return dbQuery.one<Client>(create, [
            userId,
            data.first_name,
            data.last_name,
            data.currency_code,
        ]);
    }

    async update(id: string, userId: string, data: UpdateClientValidator): Promise<Client> {
        return dbQuery.one<Client>(update, [
            data.first_name    ?? null,
            data.last_name     ?? null,
            data.currency_code ?? null,
            id,
            userId,
        ]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
