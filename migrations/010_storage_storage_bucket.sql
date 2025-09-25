-- Create storage bucket for property images (private by default)
DO $$ BEGIN
  PERFORM 1 FROM storage.buckets WHERE id = 'property-images';
  IF NOT FOUND THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('property-images', 'property-images', false);
  END IF;
END $$;

-- Configure optional settings (if columns exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='storage' AND table_name='buckets' AND column_name='file_size_limit') THEN
    UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'property-images';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='storage' AND table_name='buckets' AND column_name='allowed_mime_types') THEN
    UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[] WHERE id = 'property-images';
  END IF;
END $$;

-- RLS on storage.objects is managed by Supabase and enabled by default.

-- Useful index for bucket lookups
CREATE INDEX IF NOT EXISTS storage_objects_bucket_name_idx ON storage.objects (bucket_id, name);
CREATE INDEX IF NOT EXISTS storage_objects_owner_idx ON storage.objects (owner);

-- Policies for property-images bucket
-- Read policy: allow
--  - anyone to read files under the "public/" prefix
--  - owners to read their own files
DROP POLICY IF EXISTS "property-images-read" ON storage.objects;
CREATE POLICY IF NOT EXISTS "property-images-read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'property-images'
    AND (
      name LIKE 'public/%' OR (owner IS NOT NULL AND owner = auth.uid())
    )
  );

-- Insert policy: authenticated users may upload to either
--  - their own user folder: <uid>/*
--  - the public folder: public/*
-- Owner must equal the uploading user
DROP POLICY IF EXISTS "property-images-insert" ON storage.objects;
CREATE POLICY IF NOT EXISTS "property-images-insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
    AND (
      name LIKE (auth.uid()::text || '/%') OR name LIKE 'public/%'
    )
  );

-- Update policy: only owners can update their objects in this bucket
DROP POLICY IF EXISTS "property-images-update" ON storage.objects;
CREATE POLICY IF NOT EXISTS "property-images-update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'property-images' AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'property-images' AND owner = auth.uid()
  );

-- Delete policy: only owners can delete their objects in this bucket
DROP POLICY IF EXISTS "property-images-delete" ON storage.objects;
CREATE POLICY IF NOT EXISTS "property-images-delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'property-images' AND owner = auth.uid()
  );
