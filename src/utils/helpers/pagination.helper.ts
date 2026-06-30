export interface PaginatedResult<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

export function paginate<T>(items: T[], page: number, limit: number, total: number): PaginatedResult<T> {
    const total_pages = Math.ceil(total / limit) || 1;
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1,
        },
    };
}
