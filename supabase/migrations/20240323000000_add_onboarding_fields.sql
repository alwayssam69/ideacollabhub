-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS looking_for TEXT[],
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create enum for roles
CREATE TYPE user_role AS ENUM (
    'founder',
    'developer',
    'designer',
    'marketer',
    'product_manager',
    'investor',
    'mentor',
    'other'
);

-- Create enum for looking_for options
CREATE TYPE looking_for_type AS ENUM (
    'co_founder',
    'developer',
    'designer',
    'mentor',
    'investor',
    'advisor',
    'team_member',
    'collaborator'
);

-- Update profiles table to use enums
ALTER TABLE profiles
ALTER COLUMN role TYPE user_role USING role::user_role,
ALTER COLUMN looking_for TYPE looking_for_type[] USING looking_for::looking_for_type[];

-- Create index for faster matching queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_looking_for ON profiles USING GIN(looking_for);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;

-- Add RLS policies for profiles
CREATE POLICY "Enable read access for all users"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create function to check if profile is complete
CREATE OR REPLACE FUNCTION is_profile_complete(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = profile_id
        AND full_name IS NOT NULL
        AND role IS NOT NULL
        AND skills IS NOT NULL
        AND looking_for IS NOT NULL
        AND location IS NOT NULL
        AND bio IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 