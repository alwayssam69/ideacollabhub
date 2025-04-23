
export interface OnboardingFormData {
  fullName: string;
  stage: string;
  industry: string;
  role: string;
  skills: string[];
  looking_for: string[];
  project_stage?: string;
  project_description?: string;
  preferred_industries?: string[];
  preferred_project_types?: string[];
  motivation?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  profilePhoto?: File;
}
