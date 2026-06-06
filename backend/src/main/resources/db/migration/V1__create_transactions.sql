CREATE TABLE IF NOT EXISTS transactions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    type            VARCHAR(10) NOT NULL,          -- INCOME / EXPENSE
    category        VARCHAR(50) NOT NULL,          -- GROCERIES, RENT...
    description     VARCHAR(255),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'TRY',
    transaction_date DATE NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type
ON transactions(user_id, type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category
ON transactions(user_id, category);
