export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    partner_id: string | null;
    base_currency: string;
    wedding_location: string | null;
    created_at: Date;
    updated_at: Date;
}

export type SafeUser = Omit<User, 'password'>