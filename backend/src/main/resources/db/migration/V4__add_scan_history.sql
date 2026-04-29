-- V4__add_scan_history.sql

CREATE TABLE scan_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES tickets(id),
    staff_id    UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    reason      VARCHAR(255),
    scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_history_ticket_id ON scan_history(ticket_id);
CREATE INDEX idx_scan_history_staff_id ON scan_history(staff_id);
