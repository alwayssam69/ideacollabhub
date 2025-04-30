
export interface OnboardingFormData {
  // Step 1: Basic Information
  fullName: string;
  role: string;
  city: string;
  linkedin_url?: string;
  portfolio_url?: string;
  profilePhoto?: File;
  
  // Step 2: Professional Background
  experience?: string;
  education?: string;
  work_history?: string;
  
  // Step 3: Skills & Tools
  industry: string;
  skills: string[];
  secondary_skills?: string[];
  tools?: string[];
  
  // Step 4: Work Preferences
  availability?: string;
  work_style?: string;
  location_preference?: string;
  stage: string;
  preferred_project_stages?: string[];
  
  // Step 5: Intent & Goals
  looking_for: string[];
  goals?: string[];
  long_term_goal?: string;
  
  // Step 6: Personality & Experience
  past_startup_experience?: boolean;
  willing_to_relocate?: boolean;
  core_values?: string[];
  
  // Additional fields from existing profile
  motivation?: string;
  bio?: string;
  project_stage?: string;
  project_description?: string;
  preferred_industries?: string[];
  preferred_project_types?: string[];
  onboarding_completed?: boolean;
}

export interface OnboardingStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
}
