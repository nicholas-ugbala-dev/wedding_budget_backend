import { ApiError } from '../../utils/error';
import { Vendor } from '../../config/database/models';
import { IVendorsService, IVendorsRepository } from './interface/vendors.interface';
import { CreateVendorValidator, UpdateVendorValidator } from './validation/vendors.validations';
import vendorsRepository from './repository/vendors.repository';

export class VendorsService implements IVendorsService {
    constructor(private readonly repository: IVendorsRepository) {}

    async list(userId: string, search?: string): Promise<Vendor[]> {
        return this.repository.findAll(userId, search);
    }

    async create(userId: string, data: CreateVendorValidator): Promise<Vendor> {
        return this.repository.create(userId, data);
    }

    async findOrCreate(userId: string, data: CreateVendorValidator): Promise<Vendor> {
        return this.repository.findOrCreate(userId, data);
    }

    async update(id: string, userId: string, data: UpdateVendorValidator): Promise<Vendor> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Vendor not found');
        }
        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Vendor not found');
        }
        await this.repository.delete(id, userId);
    }
}

const vendorsService = new VendorsService(vendorsRepository);
export default vendorsService;
