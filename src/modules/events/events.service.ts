import { ApiError } from '../../utils/error';
import { IEventsService, IEventsRepository, Event } from './interface/events.interface';
import { CreateEventValidator, UpdateEventValidator } from './validation/events.validations';
import eventsRepository from './repository/events.repository';

export class EventsService implements IEventsService {
    constructor(private readonly repository: IEventsRepository) {}

    async list(userId: string): Promise<Event[]> {
        const results = await this.repository.findAll(userId);
        return results ?? [];
    }

    async create(userId: string, data: CreateEventValidator): Promise<Event> {
        return this.repository.create(userId, data);
    }

    async update(id: string, userId: string, data: UpdateEventValidator): Promise<Event> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Event not found');
        }
        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Event not found');
        }
        await this.repository.delete(id, userId);
    }
}

const eventsService = new EventsService(eventsRepository);
export default eventsService;
