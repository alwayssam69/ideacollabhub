
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
}
