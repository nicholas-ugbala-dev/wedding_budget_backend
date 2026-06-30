import { Vendor } from '../../../config/database/models';
import { CreateVendorValidator, UpdateVendorValidator } from '../validation/vendors.validations';

export interface IVendorsRepository {
    findAll(userId: string, search?: string): Promise<Vendor[]>;
    findById(id: string, userId: string): Promise<Vendor | null>;
    findByName(userId: string, name: string): Promise<Vendor | null>;
    create(userId: string, data: CreateVendorValidator): Promise<Vendor>;
    findOrCreate(userId: string, data: CreateVendorValidator): Promise<Vendor>;
    update(id: string, userId: string, data: UpdateVendorValidator): Promise<Vendor>;
    delete(id: string, userId: string): Promise<void>;
}

export interface IVendorsService {
    list(userId: string, search?: string): Promise<Vendor[]>;
    create(userId: string, data: CreateVendorValidator): Promise<Vendor>;
    findOrCreate(userId: string, data: CreateVendorValidator): Promise<Vendor>;
    update(id: string, userId: string, data: UpdateVendorValidator): Promise<Vendor>;
    delete(id: string, userId: string): Promise<void>;
}
