-- Update profiles table schema
ALTER TABLE profiles
  -- Add new columns
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS meeting_preference text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS project_stage text,
  ADD COLUMN IF NOT EXISTS project_description text,
  ADD COLUMN IF NOT EXISTS preferred_industries text[],
  ADD COLUMN IF NOT EXISTS preferred_project_types text[],
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  -- Modify existing columns
  ALTER COLUMN looking_for TYPE text[] USING string_to_array(looking_for, ',');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all profiles
CREATE POLICY "Allow public read access to profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Allow users to delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS profiles_industry_idx ON profiles(industry);
CREATE INDEX IF NOT EXISTS profiles_skills_idx ON profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS profiles_looking_for_idx ON profiles USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS profiles_preferred_industries_idx ON profiles USING GIN(preferred_industries);
CREATE INDEX IF NOT EXISTS profiles_preferred_project_types_idx ON profiles USING GIN(preferred_project_types);

-- Add trigger to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 