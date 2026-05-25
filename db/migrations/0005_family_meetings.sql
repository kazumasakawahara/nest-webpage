-- 0005_family_meetings.sql
-- 家族会
CREATE TABLE family_meetings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    held_on             DATE NOT NULL,
    title               TEXT NOT NULL,
    location            TEXT,
    agenda              TEXT,
    minutes_pdf_path    TEXT,
    is_upcoming         BOOLEAN NOT NULL DEFAULT false,
    visible             BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX family_meetings_held_on_idx ON family_meetings (held_on DESC);
CREATE UNIQUE INDEX family_meetings_upcoming_uidx
    ON family_meetings (is_upcoming)
    WHERE is_upcoming = true;
