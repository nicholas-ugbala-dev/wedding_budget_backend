import { CreateEventValidator, UpdateEventValidator } from '../validation/events.validations';

export interface Event {
    id: string;
    user_id: string;
    name: string;
    created_at: Date;
}

export interface IEventsRepository {
    findAll(userId: string): Promise<Event[]>;
    findById(id: string, userId: string): Promise<Event | null>;
    create(userId: string, data: CreateEventValidator): Promise<Event>;
    update(id: string, userId: string, data: UpdateEventValidator): Promise<Event>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IEventsService {
    list(userId: string): Promise<Event[]>;
    create(userId: string, data: CreateEventValidator): Promise<Event>;
    update(id: string, userId: string, data: UpdateEventValidator): Promise<Event>;
    delete(id: string, userId: string): Promise<void>;
}
