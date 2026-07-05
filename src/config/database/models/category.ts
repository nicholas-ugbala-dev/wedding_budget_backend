export interface Category {
    id: string;
    user_id: string;
    event_id: string | null;
    event_name: string | null;
    name: string;
    created_at: Date;
    updated_at: Date;
}
