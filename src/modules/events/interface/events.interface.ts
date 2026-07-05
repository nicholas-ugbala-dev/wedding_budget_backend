import { CreateEventValidator, UpdateEventValidator } from '../validation/events.validations';

export interface Event {
    id: string;
    user_id: string;
    name: string;
    event_type: string | null;
    date: string | null;
    location: string | null;
    vendor_currency: string | null;
    budget: number | null;
    client_id: string | null;
    reporting_currency_code: string | null;
    reporting_budget: number | null;
    created_at: Date;
}

export interface IEventsRepository {
    findAll(userId: string, clientId?: string): Promise<Event[]>;
    findById(id: string, userId: string): Promise<Event | null>;
    create(userId: string, data: CreateEventValidator, reportingCurrencyCode: string | null, reportingBudget: number | null): Promise<Event>;
    update(id: string, userId: string, data: UpdateEventValidator, reportingCurrencyCode: string | null, reportingBudget: number | null): Promise<Event>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IEventsService {
    list(userId: string, clientId?: string): Promise<Event[]>;
    create(userId: string, data: CreateEventValidator): Promise<Event>;
    update(id: string, userId: string, data: UpdateEventValidator): Promise<Event>;
    delete(id: string, userId: string): Promise<void>;
}
