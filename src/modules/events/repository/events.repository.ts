import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IEventsRepository, Event } from '../interface/events.interface';
import { CreateEventValidator, UpdateEventValidator } from '../validation/events.validations';
import EventsQueries from '../query/events.queries';

const { findAll, findById, create, update, remove } = EventsQueries;

export class EventsRepository implements IEventsRepository {
    async findAll(userId: string): Promise<Event[]> {
        return dbQuery.manyOrNone<Event>(findAll, [userId]) as Promise<Event[]>;
    }

    async findById(id: string, userId: string): Promise<Event | null> {
        return dbQuery.oneOrNone<Event>(findById, [id, userId]);
    }

    async create(userId: string, data: CreateEventValidator): Promise<Event> {
        return dbQuery.one<Event>(create, [
            userId,
            data.name,
            data.event_type   ?? null,
            data.date         ?? null,
            data.location     ?? null,
            data.vendor_currency ?? null,
            data.budget       ?? null,
            data.client_id    ?? null,
        ]);
    }

    async update(id: string, userId: string, data: UpdateEventValidator): Promise<Event> {
        return dbQuery.one<Event>(update, [
            data.name            ?? null,
            data.event_type      ?? null,
            data.date            ?? null,
            data.location        ?? null,
            data.vendor_currency ?? null,
            data.budget          ?? null,
            data.client_id       ?? null,
            id,
            userId,
        ]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const eventsRepository = new EventsRepository();
export default eventsRepository;
