import { CreateCeremonyValidator, UpdateCeremonyValidator } from '../validation/ceremonies.validations';

export interface Ceremony {
    id: string;
    user_id: string;
    name: string;
    created_at: Date;
}

export interface ICeremoniesRepository {
    findAll(userId: string): Promise<Ceremony[]>;
    findById(id: string, userId: string): Promise<Ceremony | null>;
    create(userId: string, data: CreateCeremonyValidator): Promise<Ceremony>;
    update(id: string, userId: string, data: UpdateCeremonyValidator): Promise<Ceremony>;
    delete(id: string, userId: string): Promise<void>;
}

export interface ICeremoniesService {
    list(userId: string): Promise<Ceremony[]>;
    create(userId: string, data: CreateCeremonyValidator): Promise<Ceremony>;
    update(id: string, userId: string, data: UpdateCeremonyValidator): Promise<Ceremony>;
    delete(id: string, userId: string): Promise<void>;
}
