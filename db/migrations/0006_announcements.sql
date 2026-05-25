-- 0006_announcements.sql
-- 会員向けお知らせ
CREATE TABLE announcements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_markdown   TEXT NOT NULL,
    published       BOOLEAN NOT NULL DEFAULT false,
    audience        TEXT NOT NULL DEFAULT 'member' CHECK (audience IN ('member', 'family')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX announcements_published_created_idx
    ON announcements (published, created_at DESC);

CREATE TRIGGER announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
