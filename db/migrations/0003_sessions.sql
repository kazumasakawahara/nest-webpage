-- 0003_sessions.sql
-- ログインセッション
CREATE TABLE sessions (
    session_id      TEXT PRIMARY KEY,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_member_id_idx ON sessions (member_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
