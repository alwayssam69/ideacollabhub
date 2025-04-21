-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS looking_for_type CASCADE;
DROP TYPE IF EXISTS connection_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS experience_level CASCADE;
DROP TYPE IF EXISTS project_stage CASCADE;
DROP TYPE IF EXISTS availability CASCADE;
DROP TYPE IF EXISTS work_type CASCADE;

-- Create enums
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

CREATE TYPE connection_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);

CREATE TYPE project_status AS ENUM (
    'planning',
    'in_progress',
    'completed',
    'on_hold'
);

CREATE TYPE experience_level AS ENUM (
    'student',
    'entry_level',
    'mid_level',
    'senior_level',
    'executive'
);

CREATE TYPE project_stage AS ENUM (
    'ideation',
    'mvp',
    'early_traction',
    'growth',
    'scale'
);

CREATE TYPE availability AS ENUM (
    'full_time',
    'part_time',
    'weekends',
    'evenings',
    'flexible'
);

CREATE TYPE work_type AS ENUM (
    'remote',
    'hybrid',
    'onsite',
    'flexible'
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT,
    avatar_url TEXT,
    bio TEXT NOT NULL,
    location TEXT NOT NULL,
    role user_role NOT NULL,
    skills TEXT[] NOT NULL,
    looking_for looking_for_type[] NOT NULL,
    preferred_industries TEXT[] NOT NULL,
    preferred_project_types TEXT[] NOT NULL,
    experience_level experience_level NOT NULL,
    project_stage project_stage NOT NULL,
    availability availability NOT NULL,
    work_type work_type NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    timezone TEXT,
    languages TEXT[],
    education TEXT[],
    certifications TEXT[],
    previous_projects TEXT[],
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create connections table
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status connection_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(requester_id, recipient_id)
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create project_members table
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (project_id, member_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_profiles_id ON profiles(id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_looking_for ON profiles USING GIN(looking_for);
CREATE INDEX idx_profiles_preferred_industries ON profiles USING GIN(preferred_industries);
CREATE INDEX idx_profiles_preferred_project_types ON profiles USING GIN(preferred_project_types);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_member ON project_members(member_id);

-- Create RLS policies for profiles
CREATE POLICY "Enable read access for all users on profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users on profiles"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id on profiles"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create RLS policies for connections
CREATE POLICY "Enable read access for authenticated users on connections"
    ON connections FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Enable insert for authenticated users on connections"
    ON connections FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Enable update for connection participants"
    ON connections FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Create RLS policies for projects
CREATE POLICY "Enable read access for all users on projects"
    ON projects FOR SELECT
    USING (true);

CREATE POLICY "Enable all access for project owners"
    ON projects FOR ALL
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Create RLS policies for project_members
CREATE POLICY "Enable read access for all users on project_members"
    ON project_members FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for project owners"
    ON project_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE id = project_id AND owner_id = auth.uid()
    ));

-- Create RLS policies for messages
CREATE POLICY "Enable read access for message participants"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Enable insert for authenticated users on messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 