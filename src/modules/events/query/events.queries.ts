const COLS = `id, user_id, name, event_type, date, location, vendor_currency, budget, client_id, reporting_currency_code, reporting_budget, created_at`;

// Without clientId: $1 = user_id — returns the user's own events
// With clientId: $1 = client_id — returns all events for that client (ownership validated in service)
const findAll = (clientId?: string) => `
    SELECT ${COLS}
    FROM events
    WHERE ${clientId ? `client_id = $1::uuid` : `user_id = $1`}
    ORDER BY created_at ASC
`;

const findById = `
    SELECT ${COLS}
    FROM events
    WHERE id = $1 AND user_id = $2
`;

// $1=user_id $2=name $3=event_type $4=date $5=location $6=vendor_currency $7=budget $8=client_id
// $9=reporting_currency_code $10=reporting_budget
const create = `
    INSERT INTO events (user_id, name, event_type, date, location, vendor_currency, budget, client_id, reporting_currency_code, reporting_budget)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING ${COLS}
`;

// $1=name $2=event_type $3=date $4=location $5=vendor_currency $6=budget $7=client_id
// $8=reporting_currency_code $9=reporting_budget $10=id $11=user_id
const update = `
    UPDATE events SET
        name                    = COALESCE($1, name),
        event_type              = COALESCE($2, event_type),
        date                    = COALESCE($3, date),
        location                = COALESCE($4, location),
        vendor_currency         = COALESCE($5, vendor_currency),
        budget                  = COALESCE($6, budget),
        client_id               = COALESCE($7, client_id),
        reporting_currency_code = COALESCE($8, reporting_currency_code),
        reporting_budget        = COALESCE($9, reporting_budget)
    WHERE id = $10 AND user_id = $11
    RETURNING ${COLS}
`;

const remove = `
    DELETE FROM events
    WHERE id = $1 AND user_id = $2
`;

const EventsQueries = { findAll, findById, create, update, remove };

export default EventsQueries;
