// Import the necessary components and hooks
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Define a type for the profile data
type OnboardingProfileData = {
  full_name: string;
  title: string | null; // this is used instead of role
  skills: string[] | null;
  looking_for: string[] | null;
  location: string | null;
  bio: string | null;
  onboarding_completed: boolean;
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<OnboardingProfileData>({
    full_name: profile?.full_name || '',
    title: profile?.title || '',
    skills: profile?.skills || [],
    looking_for: profile?.looking_for || [],
    location: profile?.location || '',
    bio: profile?.bio || '',
    onboarding_completed: true,
  });
  const [skillInput, setSkillInput] = useState<string>('');
  const [lookingForInput, setLookingForInput] = useState<string>('');

  // Function to add a skill
  const addSkill = () => {
    if (skillInput && !profileData.skills?.includes(skillInput)) {
      setProfileData({
        ...profileData,
        skills: [...(profileData.skills || []), skillInput],
      });
      setSkillInput('');
    }
  };

  // Function to remove a skill
  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills?.filter(s => s !== skill) || [],
    });
  };

  // Function to add a looking for item
  const addLookingFor = () => {
    if (lookingForInput && !profileData.looking_for?.includes(lookingForInput)) {
      setProfileData({
        ...profileData,
        looking_for: [...(profileData.looking_for || []), lookingForInput],
      });
      setLookingForInput('');
    }
  };

  // Function to remove a looking for item
  const removeLookingFor = (item: string) => {
    setProfileData({
      ...profileData,
      looking_for: profileData.looking_for?.filter(i => i !== item) || [],
    });
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      await updateProfile({ 
        ...profileData,
        onboarding_completed: true 
      });
      
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to the next step
  const nextStep = () => {
    setStep(step + 1);
  };

  // Function to navigate to the previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Render content based on the current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  placeholder="e.g., Software Engineer, Designer"
                  value={profileData.title || ''}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={nextStep}>
              Next
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    id="skills"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profileData.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lookingFor">Looking For</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    id="lookingFor"
                    placeholder="Add what you're looking for"
                    value={lookingForInput}
                    onChange={(e) => setLookingForInput(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={addLookingFor}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profileData.looking_for?.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeLookingFor(item)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  placeholder="Enter your location"
                  value={profileData.location || ''}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself"
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
        <p className="text-muted-foreground mb-8">
          Tell us a bit about yourself to get started.
        </p>
        {renderStepContent()}
      </div>
    </div>
  );
}
