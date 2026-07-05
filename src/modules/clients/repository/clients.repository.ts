import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IClientsRepository, Client } from '../interface/clients.interface';
import { CreateClientValidator, UpdateClientValidator, ListClientsValidator } from '../validation/clients.validations';
import ClientsQueries from '../query/clients.queries';

const { findById, create, update, remove } = ClientsQueries;

export class ClientsRepository implements IClientsRepository {
    async findAll(userId: string, filters: ListClientsValidator): Promise<{ rows: Client[]; total: number }> {
        const { search, page, limit } = filters;
        const hasSearch = !!search?.trim();
        const pattern = hasSearch ? `%${search!.trim()}%` : undefined;

        const params: (string | number)[] = [userId];
        if (hasSearch) params.push(pattern!);
        params.push(limit);
        params.push((page - 1) * limit);

        type Row = Client & { total_count: string };
        const rows = await dbQuery.manyOrNone<Row>(ClientsQueries.findAll(hasSearch), params) ?? [];
        const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;

        return { rows, total };
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
