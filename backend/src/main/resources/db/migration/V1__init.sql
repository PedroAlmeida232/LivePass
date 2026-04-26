-- V1__init.sql

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,        -- bcrypt
    role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | STAFF
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    order_id     VARCHAR(100) UNIQUE NOT NULL,  -- ID do pedido PagBank
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | PAID | CANCELLED
    totp_secret  VARCHAR(64),                   -- preenchido após confirmação
    is_used      BOOLEAN NOT NULL DEFAULT FALSE,
    used_at      TIMESTAMPTZ,
    used_by_staff UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_order_id ON tickets(order_id);
