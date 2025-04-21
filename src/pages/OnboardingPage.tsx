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
import { supabase } from "@/integrations/supabase/client";

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

const roles = [
  "Founder",
  "Developer",
  "Designer",
  "Product Manager",
  "Marketing",
  "Sales",
  "Other",
];

const skills = [
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Product Strategy",
  "Marketing",
  "Sales",
  "Business Development",
  "Machine Learning",
  "Blockchain",
  "Mobile Development",
  "DevOps",
];

const lookingFor = [
  "Co-founder",
  "Technical Co-founder",
  "Developer",
  "Designer",
  "Mentor",
  "Investor",
  "Advisor",
];

const experienceLevels = [
  "Student",
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive",
];

const projectStages = [
  "Ideation",
  "MVP",
  "Early Traction",
  "Growth",
  "Scale",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Social Impact",
  "Entertainment",
  "Manufacturing",
  "Real Estate",
  "Other",
];

const preferredWorkTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Remote",
  "Hybrid",
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    title: profile?.title || "",
    skills: profile?.skills || [],
    looking_for: profile?.looking_for || [],
    location: profile?.location || "",
    bio: profile?.bio || "",
    experience_level: profile?.experience_level || "",
    project_stage: profile?.project_stage || "",
    preferred_industries: profile?.preferred_industries || [],
    preferred_work_type: profile?.preferred_work_type || [],
    availability: profile?.availability || "Full-time",
    linkedin_url: profile?.linkedin_url || "",
    portfolio_url: profile?.portfolio_url || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleLookingFor = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(item)
        ? prev.looking_for.filter((l) => l !== item)
        : [...prev.looking_for, item],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Update the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.title,
          skills: formData.skills,
          looking_for: formData.looking_for,
          location: formData.location,
          bio: formData.bio,
          experience_level: formData.experience_level,
          project_stage: formData.project_stage,
          preferred_industries: formData.preferred_industries,
          preferred_work_type: formData.preferred_work_type,
          availability: formData.availability,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
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
              />
            </div>
            <div>
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {roles.map((role) => (
                  <Button
                    key={role}
                    variant={formData.title === role ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, title: role }))}
                    className="w-full"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Experience Level</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {experienceLevels.map((level) => (
                  <Button
                    key={level}
                    variant={formData.experience_level === level ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, experience_level: level }))}
                    className="w-full"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                    {formData.skills.includes(skill) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Project Stage</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {projectStages.map((stage) => (
                  <Button
                    key={stage}
                    variant={formData.project_stage === stage ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, project_stage: stage }))}
                    className="w-full"
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Looking For</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {lookingFor.map((item) => (
                  <Badge
                    key={item}
                    variant={formData.looking_for.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLookingFor(item)}
                  >
                    {item}
                    {formData.looking_for.includes(item) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Preferred Industries</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {industries.map((industry) => (
                  <Badge
                    key={industry}
                    variant={formData.preferred_industries.includes(industry) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      preferred_industries: prev.preferred_industries.includes(industry)
                        ? prev.preferred_industries.filter((i) => i !== industry)
                        : [...prev.preferred_industries, industry],
                    }))}
                  >
                    {industry}
                    {formData.preferred_industries.includes(industry) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
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
              />
            </div>
            <div>
              <Label>Preferred Work Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {preferredWorkTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={formData.preferred_work_type.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      preferred_work_type: prev.preferred_work_type.includes(type)
                        ? prev.preferred_work_type.filter((t) => t !== type)
                        : [...prev.preferred_work_type, type],
                    }))}
                  >
                    {type}
                    {formData.preferred_work_type.includes(type) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
            <div>
              <Label htmlFor="portfolio_url">Portfolio/Website</Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleInputChange}
                placeholder="https://your-portfolio.com"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                className="h-32"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of 4 - Let's get to know you better
          </p>
        </div>

        <div className="space-y-4">{renderStep()}</div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
