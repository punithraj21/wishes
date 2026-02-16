-- ===================================
-- Customizable Wishes Platform Schema
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- Table: wishes
-- ===================================
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  person_name TEXT NOT NULL,
  title TEXT NOT NULL,
  special_date DATE,
  message TEXT DEFAULT '',
  theme TEXT DEFAULT 'cartoon',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX idx_wishes_slug ON wishes(slug);
CREATE INDEX idx_wishes_created_by ON wishes(created_by);

-- ===================================
-- Table: wish_media
-- ===================================
CREATE TABLE wish_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_id UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio')),
  file_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_wish_media_wish_id ON wish_media(wish_id);

-- ===================================
-- Row Level Security
-- ===================================

-- Enable RLS
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_media ENABLE ROW LEVEL SECURITY;

-- Public read access for wishes (via slug)
CREATE POLICY "Public can view wishes"
  ON wishes FOR SELECT
  USING (true);

-- Only creator can insert
CREATE POLICY "Users can create their own wishes"
  ON wishes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only creator can update
CREATE POLICY "Users can update their own wishes"
  ON wishes FOR UPDATE
  USING (auth.uid() = created_by);

-- Only creator can delete
CREATE POLICY "Users can delete their own wishes"
  ON wishes FOR DELETE
  USING (auth.uid() = created_by);

-- Public read access for wish_media
CREATE POLICY "Public can view wish media"
  ON wish_media FOR SELECT
  USING (true);

-- Only wish creator can insert media
CREATE POLICY "Users can add media to their wishes"
  ON wish_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishes WHERE wishes.id = wish_media.wish_id AND wishes.created_by = auth.uid()
    )
  );

-- Only wish creator can update media
CREATE POLICY "Users can update media of their wishes"
  ON wish_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishes WHERE wishes.id = wish_media.wish_id AND wishes.created_by = auth.uid()
    )
  );

-- Only wish creator can delete media
CREATE POLICY "Users can delete media of their wishes"
  ON wish_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishes WHERE wishes.id = wish_media.wish_id AND wishes.created_by = auth.uid()
    )
  );

-- ===================================
-- Storage Bucket (run in Supabase dashboard or via API)
-- ===================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('wishes', 'wishes', true);

-- Storage Policies
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'wishes');
-- CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wishes' AND auth.role() = 'authenticated');
-- CREATE POLICY "Owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'wishes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===================================
-- Updated_at trigger
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wishes_updated_at
  BEFORE UPDATE ON wishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
