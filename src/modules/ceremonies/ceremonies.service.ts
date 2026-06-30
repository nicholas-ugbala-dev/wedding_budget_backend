import { ApiError } from '../../utils/error';
import { ICeremoniesService, ICeremoniesRepository, Ceremony } from './interface/ceremonies.interface';
import { CreateCeremonyValidator, UpdateCeremonyValidator } from './validation/ceremonies.validations';
import ceremoniesRepository from './repository/ceremonies.repository';

export class CeremoniesService implements ICeremoniesService {
    constructor(private readonly repository: ICeremoniesRepository) {}

    async list(userId: string): Promise<Ceremony[]> {
        const results = await this.repository.findAll(userId);
        return results ?? [];
    }

    async create(userId: string, data: CreateCeremonyValidator): Promise<Ceremony> {
        return this.repository.create(userId, data);
    }

    async update(id: string, userId: string, data: UpdateCeremonyValidator): Promise<Ceremony> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Ceremony not found');
        }
        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Ceremony not found');
        }
        await this.repository.delete(id, userId);
    }
}

const ceremoniesService = new CeremoniesService(ceremoniesRepository);
export default ceremoniesService;
