import { ApiError } from '../../utils/error';
import { IEventsService, IEventsRepository, Event } from './interface/events.interface';
import { CreateEventValidator, UpdateEventValidator } from './validation/events.validations';
import eventsRepository from './repository/events.repository';
import clientsRepository from '../clients/repository/clients.repository';
import currenciesService from '../currencies/currencies.service';
import authRepository from '../auth/repository/auth.repository';
import { getRate } from '../../utils/exchange-rate';

export class EventsService implements IEventsService {
    constructor(private readonly repository: IEventsRepository) {}

    async list(userId: string, clientId?: string): Promise<Event[]> {
        if (clientId) {
            const client = await clientsRepository.findById(clientId, userId);
            if (!client) throw new ApiError(403, 'Client not found or access denied');
        }
        const results = await this.repository.findAll(userId, clientId);
        return results ?? [];
    }

    private async deriveReportingBudget(userId: string, clientId: string | null | undefined, budget: number | null | undefined): Promise<{ reportingCurrencyCode: string | null; reportingBudget: number | null }> {
        if (budget == null) return { reportingCurrencyCode: null, reportingBudget: null };

        const user = await authRepository.findById(userId);
        const reportingCurrency = clientId
            ? (await clientsRepository.findById(clientId, userId))?.currency_code ?? user!.base_currency
            : user!.base_currency;

        // Budget is entered by the user in their own reporting currency — no conversion needed
        return { reportingCurrencyCode: reportingCurrency, reportingBudget: budget };
    }

    async create(userId: string, data: CreateEventValidator): Promise<Event> {
        if (data.client_id) {
            const client = await clientsRepository.findById(data.client_id, userId);
            if (!client) throw new ApiError(403, 'Client not found or access denied');
        }

        const { reportingCurrencyCode, reportingBudget } = await this.deriveReportingBudget(userId, data.client_id, data.budget);
        const event = await this.repository.create(userId, data, reportingCurrencyCode, reportingBudget);

        if (event.vendor_currency) {
            if (event.client_id) {
                await currenciesService.upsertClientCurrency(event.client_id, event.vendor_currency);
            } else {
                await currenciesService.upsertUserCurrency(userId, event.vendor_currency);
            }
        }
        return event;
    }

    async update(id: string, userId: string, data: UpdateEventValidator): Promise<Event> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Event not found');

        const clientId = data.client_id ?? existing.client_id;
        const budget = data.budget !== undefined ? data.budget : existing.budget;
        const { reportingCurrencyCode, reportingBudget } = await this.deriveReportingBudget(userId, clientId, budget);

        const event = await this.repository.update(id, userId, data, reportingCurrencyCode, reportingBudget);

        if (event.vendor_currency) {
            if (event.client_id) {
                await currenciesService.upsertClientCurrency(event.client_id, event.vendor_currency);
            } else {
                await currenciesService.upsertUserCurrency(userId, event.vendor_currency);
            }
        }
        return event;
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) throw new ApiError(404, 'Event not found');
        await this.repository.delete(id, userId);
    }
}

const eventsService = new EventsService(eventsRepository);
export default eventsService;
