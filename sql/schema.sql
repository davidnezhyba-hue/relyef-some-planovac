-- ============================================================
-- relyef-some-planovac — Databázové schéma pro Supabase
-- Spusťte v Supabase SQL Editoru (Settings → SQL Editor)
-- ============================================================

-- Rozšíření pro UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM typy
-- ============================================================

CREATE TYPE production_status AS ENUM ('in_progress', 'done');
CREATE TYPE approval_status   AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- Tabulka: designers
-- ============================================================

CREATE TABLE IF NOT EXISTS designers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Tabulka: videos
-- ============================================================

CREATE TABLE IF NOT EXISTS videos (
  id                        UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  title                     TEXT             NOT NULL,
  date_assigned             DATE,
  materials_ready           BOOLEAN          NOT NULL DEFAULT FALSE,
  assigned_to_designer      BOOLEAN          NOT NULL DEFAULT FALSE,
  designer_id               UUID             REFERENCES designers(id) ON DELETE SET NULL,
  production_status         production_status NOT NULL DEFAULT 'in_progress',
  finished_video_folder_url TEXT,
  approval_status           approval_status  NOT NULL DEFAULT 'pending',
  approval_sent_at          TIMESTAMPTZ,
  published_fb              TEXT,
  published_ig              TEXT,
  published_yt              TEXT,
  published_tiktok          TEXT,
  published_pinterest       TEXT,
  results_url               TEXT,
  tags                      TEXT[]           NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Trigger: automatická aktualizace updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Indexy pro rychlé vyhledávání
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_videos_date_assigned   ON videos (date_assigned DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_videos_designer_id     ON videos (designer_id);
CREATE INDEX IF NOT EXISTS idx_videos_production_status ON videos (production_status);
CREATE INDEX IF NOT EXISTS idx_videos_approval_status ON videos (approval_status);
CREATE INDEX IF NOT EXISTS idx_videos_tags            ON videos USING GIN (tags);

-- Full-text search index (Czech)
CREATE INDEX IF NOT EXISTS idx_videos_title_fts ON videos
  USING GIN (to_tsvector('simple', title));

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Povolte RLS pokud chcete přístup omezit na přihlášené uživatele.
-- Pro veřejný přístup bez autentizace tyto řádky zakomentujte.

ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos    ENABLE ROW LEVEL SECURITY;

-- Politika: přihlášení uživatelé mají plný přístup
CREATE POLICY "Authenticated users full access — designers"
  ON designers FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users full access — videos"
  ON videos FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Ukázková data (volitelné — smažte před nasazením)
-- ============================================================

-- INSERT INTO designers (name) VALUES
--   ('Jana Nováková'),
--   ('Marie Svobodová'),
--   ('Petra Dvořáková');

-- INSERT INTO videos (title, date_assigned, materials_ready, tags) VALUES
--   ('Ukázkové video 1', CURRENT_DATE, TRUE, ARRAY['ukázka', 'test']),
--   ('Ukázkové video 2', CURRENT_DATE - INTERVAL '7 days', FALSE, ARRAY['test']);
