
-- Add new fields to profiles table for the enhanced onboarding flow
ALTER TABLE profiles
  -- Professional background fields
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS work_history text,
  
  -- Skills and tools fields
  ADD COLUMN IF NOT EXISTS secondary_skills text[],
  ADD COLUMN IF NOT EXISTS tools text[],
  
  -- Work preferences fields
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS work_style text,
  ADD COLUMN IF NOT EXISTS location_preference text,
  ADD COLUMN IF NOT EXISTS preferred_project_stages text[],
  
  -- Intent and goals fields
  ADD COLUMN IF NOT EXISTS goals text[],
  ADD COLUMN IF NOT EXISTS long_term_goal text,
  
  -- Personality and experience fields
  ADD COLUMN IF NOT EXISTS past_startup_experience boolean,
  ADD COLUMN IF NOT EXISTS willing_to_relocate boolean,
  ADD COLUMN IF NOT EXISTS core_values text[];

-- Create function to check profile completion more thoroughly
CREATE OR REPLACE FUNCTION check_profile_completion(profile_row profiles)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    profile_row.full_name IS NOT NULL AND
    profile_row.industry IS NOT NULL AND
    profile_row.role IS NOT NULL AND
    profile_row.skills IS NOT NULL AND
    profile_row.stage IS NOT NULL AND
    profile_row.looking_for IS NOT NULL AND
    array_length(profile_row.skills, 1) > 0 AND
    array_length(profile_row.looking_for, 1) > 0
  );
END;
$$;

-- Create trigger to automatically update onboarding_completed status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.onboarding_completed = check_profile_completion(NEW);
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_profile_completion_trigger ON profiles;

-- Add the trigger
CREATE TRIGGER update_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();
