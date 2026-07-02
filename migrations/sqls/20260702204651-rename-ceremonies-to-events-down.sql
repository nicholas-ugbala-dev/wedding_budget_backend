ALTER TABLE events RENAME TO ceremonies;
ALTER TABLE expenses RENAME COLUMN event_id TO ceremony_id;
ALTER TABLE categories RENAME COLUMN event_id TO ceremony_id;