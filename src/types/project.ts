
export interface Project {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  looking_for: string;
  required_skills?: string[];
  duration?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  skills?: string[];
  looking_for?: string[];
  location?: string;
  industry?: string;
  onboarding_completed?: boolean;
}
