import { CreateClientValidator, UpdateClientValidator } from '../validation/clients.validations';

export interface Client {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    currency_code: string;
    created_at: Date;
    updated_at: Date;
}

export interface IClientsRepository {
    findAll(userId: string): Promise<Client[]>;
    findById(id: string, userId: string): Promise<Client | null>;
    create(userId: string, data: CreateClientValidator): Promise<Client>;
    update(id: string, userId: string, data: UpdateClientValidator): Promise<Client>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IClientsService {
    list(userId: string): Promise<Client[]>;
    create(userId: string, data: CreateClientValidator): Promise<Client>;
    update(id: string, userId: string, data: UpdateClientValidator): Promise<Client>;
    delete(id: string, userId: string): Promise<void>;
}
