
export interface OnboardingFormData {
  fullName: string;
  age: string;
  gender?: string;
  state: string;
  city: string;
  role: 'founder' | 'contributor' | 'both';
  industry: string;
  skills: string[];
  experienceLevel: string;
  yearsOfExperience: string;
  preferredIndustries: string[];
  preferredSkills: string[];
  collaborationMode: string;
  ageRangeMin: string;
  ageRangeMax: string;
  locationPreferenceState?: string;
  locationPreferenceCity?: string;
  lookingFor: string[];
  appPurpose: string[];
  startupStage?: string;
  focusArea?: string;
  subSector?: string;
  oneLiner: string;
  detailedBio?: string;
  helpOthers?: boolean;
  linkedinUrl?: string;
  portfolioUrl?: string;
}
