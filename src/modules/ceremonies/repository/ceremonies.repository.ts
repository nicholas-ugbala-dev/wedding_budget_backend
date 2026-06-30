import { dbQuery } from '../../../config/database/helper/query.helpers';
import { ICeremoniesRepository, Ceremony } from '../interface/ceremonies.interface';
import { CreateCeremonyValidator, UpdateCeremonyValidator } from '../validation/ceremonies.validations';
import CeremoniesQueries from '../query/ceremonies.queries';

const { findAll, findById, create, update, remove } = CeremoniesQueries;

export class CeremoniesRepository implements ICeremoniesRepository {
    async findAll(userId: string): Promise<Ceremony[]> {
        return dbQuery.manyOrNone<Ceremony>(findAll, [userId]) as Promise<Ceremony[]>;
    }

    async findById(id: string, userId: string): Promise<Ceremony | null> {
        return dbQuery.oneOrNone<Ceremony>(findById, [id, userId]);
    }

    async create(userId: string, data: CreateCeremonyValidator): Promise<Ceremony> {
        return dbQuery.one<Ceremony>(create, [userId, data.name]);
    }

    async update(id: string, userId: string, data: UpdateCeremonyValidator): Promise<Ceremony> {
        return dbQuery.one<Ceremony>(update, [data.name, id, userId]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const ceremoniesRepository = new CeremoniesRepository();
export default ceremoniesRepository;
