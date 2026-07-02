ALTER TABLE ceremonies RENAME TO events;
ALTER TABLE expenses RENAME COLUMN ceremony_id TO event_id;
ALTER TABLE categories RENAME COLUMN ceremony_id TO event_id;