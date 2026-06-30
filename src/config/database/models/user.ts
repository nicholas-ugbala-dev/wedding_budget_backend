export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    partner_id: string | null;
    account_type: 'couple' | 'planner';
    base_currency: string;
    event_name: string | null;
    event_date: string | null;
    wedding_location: string | null;
    created_at: Date;
    updated_at: Date;
}

export type SafeUser = Omit<User, 'password'>