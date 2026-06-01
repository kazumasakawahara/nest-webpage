-- 0001_members.sql
-- 会員マスタ
CREATE TABLE members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    display_name    TEXT,
    role            TEXT NOT NULL CHECK (role IN ('member', 'family')),
    is_staff        BOOLEAN NOT NULL DEFAULT false,
    joined_at       DATE NOT NULL,
    note            TEXT,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 有効な会員のメアドはユニーク
CREATE UNIQUE INDEX members_email_active_uidx
    ON members (email)
    WHERE deleted_at IS NULL;

-- スタッフ検索用
CREATE INDEX members_is_staff_idx
    ON members (is_staff)
    WHERE is_staff = true;

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
