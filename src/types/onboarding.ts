
export interface OnboardingFormData {
  fullName: string;
  stage: string;
  location: string;
  industry: string;
  skills: string[];
  purposes: string[];
  availability: string;
  meetingPreference: string;
  bio: string;
  avatar?: File | null;
  website?: string;
}

export interface ProfileWithWebsite {
  id: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  skills?: string[];
  looking_for?: string[];
  preferred_industries?: string[];
  preferred_project_types?: string[];
  experience?: string;
  industry?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  meeting_preference?: string;
  availability?: string;
  motivation?: string;
  stage?: string;
  project_description?: string;
  project_stage?: string;
  onboarding_completed?: boolean;
}
