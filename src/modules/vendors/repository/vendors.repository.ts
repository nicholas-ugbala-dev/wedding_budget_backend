import { dbQuery } from '../../../config/database/helper/query.helpers';
import { Vendor } from '../../../config/database/models';
import { IVendorsRepository } from '../interface/vendors.interface';
import { CreateVendorValidator, UpdateVendorValidator } from '../validation/vendors.validations';
import VendorsQueries from '../query/vendors.queries';

const { findAll, findById, findByName, create, update, remove } = VendorsQueries;

export class VendorsRepository implements IVendorsRepository {
    async findAll(userId: string, search?: string): Promise<Vendor[]> {
        return (await dbQuery.manyOrNone<Vendor>(findAll, [userId, search ?? null])) ?? [];
    }

    async findById(id: string, userId: string): Promise<Vendor | null> {
        return dbQuery.oneOrNone<Vendor>(findById, [id, userId]);
    }

    async findByName(userId: string, name: string): Promise<Vendor | null> {
        return dbQuery.oneOrNone<Vendor>(findByName, [userId, name]);
    }

    async create(userId: string, data: CreateVendorValidator): Promise<Vendor> {
        return dbQuery.one<Vendor>(create, [
            userId,
            data.name,
            data.phone ?? null,
            data.email ?? null,
            data.website ?? null,
        ]);
    }

    async findOrCreate(userId: string, data: CreateVendorValidator): Promise<Vendor> {
        const existing = await this.findByName(userId, data.name);
        if (existing) return existing;
        return this.create(userId, data);
    }

    async update(id: string, userId: string, data: UpdateVendorValidator): Promise<Vendor> {
        return dbQuery.one<Vendor>(update, [
            data.name ?? null,
            data.phone ?? null,
            data.email ?? null,
            data.website ?? null,
            id,
            userId,
        ]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const vendorsRepository = new VendorsRepository();
export default vendorsRepository;
