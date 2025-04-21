import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

type OnboardingStep = 'personal' | 'professional' | 'preferences' | 'project' | 'social';

// Validation schema
const profileSchema = z.object({
  // Personal info
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  timezone: z.string().optional(),

  // Professional info
  role: z.enum(['founder', 'developer', 'designer', 'marketer', 'product_manager', 'investor', 'mentor', 'other']),
  title: z.string().min(2, 'Title is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience_level: z.enum(['student', 'entry_level', 'mid_level', 'senior_level', 'executive']),
  education: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  previous_projects: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),

  // Preferences
  looking_for: z.array(z.enum(['co_founder', 'developer', 'designer', 'mentor', 'investor', 'advisor', 'team_member', 'collaborator'])).min(1, 'At least one preference is required'),
  preferred_industries: z.array(z.string()).min(1, 'At least one industry is required'),
  preferred_project_types: z.array(z.string()).min(1, 'At least one project type is required'),
  work_type: z.enum(['remote', 'hybrid', 'onsite', 'flexible']),

  // Project info
  project_stage: z.enum(['ideation', 'mvp', 'early_traction', 'growth', 'scale']),
  availability: z.enum(['full_time', 'part_time', 'weekends', 'evenings', 'flexible']),

  // Social links
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid Website URL').optional().or(z.literal('')),
});

// Change from 'export function OnboardingPage()' to 'export default function OnboardingPage()'
export default function OnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('personal');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    // Personal info
    full_name: '',
    location: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Professional info
    role: '',
    title: '',
    skills: [] as string[],
    experience_level: '',
    education: [] as string[],
    certifications: [] as string[],
    previous_projects: [] as string[],
    languages: [] as string[],

    // Preferences
    looking_for: [] as string[],
    preferred_industries: [] as string[],
    preferred_project_types: [] as string[],
    work_type: '',

    // Project info
    project_stage: '',
    availability: '',

    // Social links
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    twitter_url: '',
    website_url: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep: OnboardingStep): boolean => {
    const stepFields: Record<OnboardingStep, (keyof typeof formData)[]> = {
      personal: ['full_name', 'location', 'bio', 'timezone'],
      professional: ['role', 'title', 'skills', 'experience_level'],
      preferences: ['looking_for', 'preferred_industries', 'preferred_project_types', 'work_type'],
      project: ['project_stage', 'availability'],
      social: ['linkedin_url', 'github_url', 'portfolio_url', 'twitter_url', 'website_url'],
    };

    const stepData = Object.fromEntries(
      stepFields[currentStep].map(field => [field, formData[field]])
    );

    try {
      const fieldsToValidate = stepFields[currentStep].reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<keyof typeof formData, true>);
      
      profileSchema.pick(fieldsToValidate as any).parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const validationResult = profileSchema.safeParse(formData);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form');
        return;
      }

      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                required
                className={errors.bio ? 'border-red-500' : ''}
                placeholder="Tell us about yourself (minimum 50 characters)"
              />
              {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select a role</option>
                <option value="founder">Founder</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="marketer">Marketer</option>
                <option value="product_manager">Product Manager</option>
                <option value="investor">Investor</option>
                <option value="mentor">Mentor</option>
                <option value="other">Other</option>
              </select>
              {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className={errors.title ? 'border-red-500' : ''}
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="skills">Skills *</Label>
              <Input
                id="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                required
                className={errors.skills ? 'border-red-500' : ''}
                placeholder="e.g., React, Node.js, Python"
              />
              {errors.skills && <p className="text-sm text-red-500 mt-1">{errors.skills}</p>}
            </div>
            <div>
              <Label htmlFor="experience_level">Experience Level *</Label>
              <select
                id="experience_level"
                value={formData.experience_level}
                onChange={(e) => handleInputChange('experience_level', e.target.value)}
                className={`w-full p-2 border rounded ${errors.experience_level ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select experience level</option>
                <option value="student">Student</option>
                <option value="entry_level">Entry Level</option>
                <option value="mid_level">Mid Level</option>
                <option value="senior_level">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
              {errors.experience_level && <p className="text-sm text-red-500 mt-1">{errors.experience_level}</p>}
            </div>
            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education.join(', ')}
                onChange={(e) => handleInputChange('education', e.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g., B.S. Computer Science, University of XYZ"
              />
            </div>
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications.join(', ')}
                onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g., AWS Certified, Google Cloud Professional"
              />
            </div>
            <div>
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={formData.languages.join(', ')}
                onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g., English, Spanish, French"
              />
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="looking_for">Looking For *</Label>
              <select
                id="looking_for"
                multiple
                value={formData.looking_for}
                onChange={(e) => handleInputChange('looking_for', Array.from(e.target.selectedOptions, option => option.value))}
                className={`w-full p-2 border rounded ${errors.looking_for ? 'border-red-500' : ''}`}
                required
              >
                <option value="co_founder">Co-founder</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="mentor">Mentor</option>
                <option value="investor">Investor</option>
                <option value="advisor">Advisor</option>
                <option value="team_member">Team Member</option>
                <option value="collaborator">Collaborator</option>
              </select>
              {errors.looking_for && <p className="text-sm text-red-500 mt-1">{errors.looking_for}</p>}
            </div>
            <div>
              <Label htmlFor="preferred_industries">Preferred Industries *</Label>
              <Input
                id="preferred_industries"
                value={formData.preferred_industries.join(', ')}
                onChange={(e) => handleInputChange('preferred_industries', e.target.value.split(',').map(s => s.trim()))}
                required
                className={errors.preferred_industries ? 'border-red-500' : ''}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
              {errors.preferred_industries && <p className="text-sm text-red-500 mt-1">{errors.preferred_industries}</p>}
            </div>
            <div>
              <Label htmlFor="preferred_project_types">Preferred Project Types *</Label>
              <Input
                id="preferred_project_types"
                value={formData.preferred_project_types.join(', ')}
                onChange={(e) => handleInputChange('preferred_project_types', e.target.value.split(',').map(s => s.trim()))}
                required
                className={errors.preferred_project_types ? 'border-red-500' : ''}
                placeholder="e.g., SaaS, Mobile App, E-commerce"
              />
              {errors.preferred_project_types && <p className="text-sm text-red-500 mt-1">{errors.preferred_project_types}</p>}
            </div>
            <div>
              <Label htmlFor="work_type">Preferred Work Type *</Label>
              <select
                id="work_type"
                value={formData.work_type}
                onChange={(e) => handleInputChange('work_type', e.target.value)}
                className={`w-full p-2 border rounded ${errors.work_type ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select work type</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
                <option value="flexible">Flexible</option>
              </select>
              {errors.work_type && <p className="text-sm text-red-500 mt-1">{errors.work_type}</p>}
            </div>
          </div>
        );

      case 'project':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="project_stage">Current Project Stage *</Label>
              <select
                id="project_stage"
                value={formData.project_stage}
                onChange={(e) => handleInputChange('project_stage', e.target.value)}
                className={`w-full p-2 border rounded ${errors.project_stage ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select project stage</option>
                <option value="ideation">Ideation</option>
                <option value="mvp">MVP</option>
                <option value="early_traction">Early Traction</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
              </select>
              {errors.project_stage && <p className="text-sm text-red-500 mt-1">{errors.project_stage}</p>}
            </div>
            <div>
              <Label htmlFor="availability">Availability *</Label>
              <select
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className={`w-full p-2 border rounded ${errors.availability ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select availability</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
              {errors.availability && <p className="text-sm text-red-500 mt-1">{errors.availability}</p>}
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                className={errors.linkedin_url ? 'border-red-500' : ''}
                placeholder="https://linkedin.com/in/your-profile"
              />
              {errors.linkedin_url && <p className="text-sm text-red-500 mt-1">{errors.linkedin_url}</p>}
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className={errors.github_url ? 'border-red-500' : ''}
                placeholder="https://github.com/your-username"
              />
              {errors.github_url && <p className="text-sm text-red-500 mt-1">{errors.github_url}</p>}
            </div>
            <div>
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                className={errors.portfolio_url ? 'border-red-500' : ''}
                placeholder="https://your-portfolio.com"
              />
              {errors.portfolio_url && <p className="text-sm text-red-500 mt-1">{errors.portfolio_url}</p>}
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                type="url"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                className={errors.twitter_url ? 'border-red-500' : ''}
                placeholder="https://twitter.com/your-handle"
              />
              {errors.twitter_url && <p className="text-sm text-red-500 mt-1">{errors.twitter_url}</p>}
            </div>
            <div>
              <Label htmlFor="website_url">Personal Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                className={errors.website_url ? 'border-red-500' : ''}
                placeholder="https://your-website.com"
              />
              {errors.website_url && <p className="text-sm text-red-500 mt-1">{errors.website_url}</p>}
            </div>
          </div>
        );
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      const steps: OnboardingStep[] = ['personal', 'professional', 'preferences', 'project', 'social'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setStep(steps[currentIndex + 1]);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = ['personal', 'professional', 'preferences', 'project', 'social'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Step {['personal', 'professional', 'preferences', 'project', 'social'].indexOf(step) + 1} of 5
          </p>
        </div>

        <div className="rounded-lg border p-6">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 'personal' || loading}
          >
            Previous
          </Button>
          <Button onClick={nextStep} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : step === 'social' ? (
              'Complete Profile'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
