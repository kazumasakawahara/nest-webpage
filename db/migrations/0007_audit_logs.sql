-- 0007_audit_logs.sql
-- 監査ログ（90日保持を想定。物理 TTL は手動運用）
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
    event           TEXT NOT NULL,
    detail          JSONB,
    ip              TEXT,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_member_created_idx
    ON audit_logs (member_id, created_at DESC);
CREATE INDEX audit_logs_created_idx
    ON audit_logs (created_at DESC);
