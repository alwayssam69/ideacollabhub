
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ROLES = [
  { value: 'founder', label: 'Founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'investor', label: 'Investor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'other', label: 'Other' },
];

const LOOKING_FOR = [
  { value: 'co_founder', label: 'Co-founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'investor', label: 'Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'collaborator', label: 'Collaborator' },
];

const SKILLS = [
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'blockchain', label: 'Blockchain' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    title: '', // Changed from 'role' to 'title' to match the profile schema
    skills: [] as string[],
    looking_for: [] as string[],
    location: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user already has some profile data
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            title: data.title || '', // Changed from 'role' to 'title'
            skills: data.skills || [],
            looking_for: data.looking_for || [],
            location: data.location || '',
            bio: data.bio || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfileData();
  }, [user, navigate]);

  useEffect(() => {
    setProgress((currentStep / 6) * 100);
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Role</Label>
              <MultiSelect
                id="title"
                options={ROLES}
                value={formData.title ? [formData.title] : []}
                onChange={(values) => handleMultiSelectChange('title', values)}
                placeholder="Select your role"
                singleSelect
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="skills">Skills</Label>
              <MultiSelect
                id="skills"
                options={SKILLS}
                value={formData.skills}
                onChange={(values) => handleMultiSelectChange('skills', values)}
                placeholder="Select your skills"
                required
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="looking_for">What are you looking for?</Label>
              <MultiSelect
                id="looking_for"
                options={LOOKING_FOR}
                value={formData.looking_for}
                onChange={(values) => handleMultiSelectChange('looking_for', values)}
                placeholder="Select what you're looking for"
                required
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your city or pincode"
                required
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio/Introduction</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                required
                rows={4}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {renderStep()}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  Complete Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
