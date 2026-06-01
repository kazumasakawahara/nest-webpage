-- 0004_newsletters.sql
-- 機関誌「巣箱」バックナンバー
CREATE TABLE newsletters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,         -- 例: '巣箱 vol.14'
    issue           TEXT NOT NULL,         -- 例: 'vol.14'
    published_on    DATE NOT NULL,
    cover_path      TEXT,                  -- storage パス（任意）
    pdf_path        TEXT NOT NULL,         -- storage パス（必須）
    sort_order      INT NOT NULL DEFAULT 0,
    visible         BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX newsletters_visible_sort_idx
    ON newsletters (visible, sort_order DESC, published_on DESC);
