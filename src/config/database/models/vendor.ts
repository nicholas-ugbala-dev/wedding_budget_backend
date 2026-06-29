export interface Vendor {
    id: string;
    user_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    created_at: Date;
    updated_at: Date;
}