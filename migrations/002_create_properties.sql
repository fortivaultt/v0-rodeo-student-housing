-- 002_create_properties.sql
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  address text,
  city text,
  state text,
  country text DEFAULT 'Nigeria',
  price_per_month numeric(10,2) NOT NULL DEFAULT 0,
  property_type text,
  is_active boolean DEFAULT true,
  verification_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
