-- 0002_magic_link_tokens.sql
-- ログイン用ワンタイムトークン
CREATE TABLE magic_link_tokens (
    token           TEXT PRIMARY KEY,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    redirect_to     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 期限切れトークン掃除用
CREATE INDEX magic_link_tokens_expires_at_idx ON magic_link_tokens (expires_at);

-- 会員別の未使用トークン検索用
CREATE INDEX magic_link_tokens_member_active_idx
    ON magic_link_tokens (member_id)
    WHERE used_at IS NULL;
