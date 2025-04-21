// Replace import from next/router with react-router-dom
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { ProfileWithWebsite } from "@/types/onboarding";

type Profile = Tables<'profiles'>;

const industries = [
  "Technology",
  "Healthcare", 
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Energy",
  "Agriculture",
  "Arts and Entertainment",
  "Government",
  "Non-profit",
  "Other",
];

const projectTypes = [
  "Mobile App",
  "Web Application",
  "AI/ML Project",
  "Hardware",
  "Social Impact",
  "Research",
  "Art Installation",
  "Open Source",
  "Other",
];

const skillsList = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "C#",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "NoSQL",
  "GraphQL",
  "REST API",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "UI Design",
  "UX Design",
  "Graphic Design",
  "Product Management",
  "Marketing",
  "Sales",
  "Finance",
  "Legal",
  "Project Management",
  "Data Analysis",
  "Machine Learning",
  "Artificial Intelligence",
  "Cybersecurity",
  "Blockchain",
  "Cloud Computing",
  "DevOps",
  "Mobile Development",
  "Web Development",
  "Game Development",
  "Embedded Systems",
  "Robotics",
  "Virtual Reality",
  "Augmented Reality",
  "Internet of Things",
  "Data Science",
  "Bioinformatics",
  "Nanotechnology",
  "Renewable Energy",
  "Aerospace Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Environmental Engineering",
  "Nuclear Engineering",
  "Software Engineering",
  "Hardware Engineering",
  "Systems Engineering",
  "Network Engineering",
  "Database Administration",
  "Security Engineering",
  "Reliability Engineering",
  "Performance Engineering",
  "Test Engineering",
  "Quality Assurance",
  "Technical Writing",
  "Technical Support",
  "Technical Sales",
  "Technical Marketing",
  "Technical Training",
  "Technical Consulting",
  "Technical Management",
  "Technical Leadership",
  "Technical Strategy",
  "Technical Innovation",
  "Technical Research",
  "Technical Development",
  "Technical Implementation",
  "Technical Integration",
  "Technical Maintenance",
  "Technical Operations",
  "Technical Support",
  "Technical Sales",
  "Technical Marketing",
  "Technical Training",
  "Technical Consulting",
  "Technical Management",
  "Technical Leadership",
  "Technical Strategy",
  "Technical Innovation",
  "Technical Research",
  "Technical Development",
  "Technical Implementation",
  "Technical Integration",
  "Technical Maintenance",
  "Technical Operations",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileWithWebsite>({
    id: user?.id || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    username: "",
    full_name: "",
    title: "",
    bio: "",
    location: "",
    website: "",
    avatar_url: "",
    skills: [],
    looking_for: [],
    preferred_industries: [],
    preferred_project_types: [],
    experience: "",
    industry: "",
    linkedin_url: "",
    portfolio_url: "",
    meeting_preference: "",
    availability: "",
    motivation: "",
    stage: "",
    project_description: "",
    project_stage: "",
    onboarding_completed: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState(skillsList);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [photoURL, setPhotoURL] = useState<string | undefined>(profile.avatar_url);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      setProfile((prev) => ({
        ...prev,
        skills: prev.skills?.filter((s) => s !== skill) || [],
      }));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
      setProfile((prev) => ({ ...prev, skills: [...(prev.skills || []), skill] }));
    }
  };

  const handlePreferredIndustriesChange = (industry: string) => {
    if (profile.preferred_industries?.includes(industry)) {
      setProfile((prev) => ({
        ...prev,
        preferred_industries: prev.preferred_industries.filter((i) => i !== industry),
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        preferred_industries: [...(prev.preferred_industries || []), industry],
      }));
    }
  };

  const handlePreferredProjectTypesChange = (projectType: string) => {
    if (profile.preferred_project_types?.includes(projectType)) {
      setProfile((prev) => ({
        ...prev,
        preferred_project_types: prev.preferred_project_types.filter((p) => p !== projectType),
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        preferred_project_types: [...(prev.preferred_project_types || []), projectType],
      }));
    }
  };

  const handleLookingForChange = (lookingFor: string) => {
    if (profile.looking_for?.includes(lookingFor)) {
      setProfile((prev) => ({
        ...prev,
        looking_for: prev.looking_for.filter((l) => l !== lookingFor),
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        looking_for: [...(prev.looking_for || []), lookingFor],
      }));
    }
  };

  const handleAvailabilityChange = (value: string) => {
    setProfile((prev) => ({ ...prev, availability: value }));
  };

  const handleMeetingPreferenceChange = (value: string) => {
    setProfile((prev) => ({ ...prev, meeting_preference: value }));
  };

  const handleExperienceChange = (value: string) => {
    setProfile((prev) => ({ ...prev, experience: value }));
  };

  const handleIndustryChange = (value: string) => {
    setProfile((prev) => ({ ...prev, industry: value }));
  };

  const handleStageChange = (value: string) => {
    setProfile((prev) => ({ ...prev, stage: value }));
  };

  const handleProjectStageChange = (value: string) => {
    setProfile((prev) => ({ ...prev, project_stage: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          ...profile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/discover");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `profile-photos/${user?.id}-${Math.random()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      setPhotoURL(publicUrl);
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to update profile photo");
    }
  };

  const handlePhotoUpdate = (newUrl: string) => {
    setPhotoURL(newUrl);
    setProfile((prev) => ({ ...prev, avatar_url: newUrl }));
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
      <p className="text-muted-foreground mb-8">
        Help others discover you by completing your profile.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Add your personal details to help others connect with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={profile.title || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio || ""}
              onChange={handleInputChange}
              placeholder="Write a short bio about yourself"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profile.location || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={profile.website || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <CardDescription>
            Share your professional background and interests.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedSkills?.length > 0 ? (
                    selectedSkills.join(", ")
                  ) : (
                    <>
                      Select Skills
                      {/* <CommandCheck className="ml-2 h-4 w-4 opacity-50 shrink-0" /> */}
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search skills..."
                    onValueChange={(value) =>
                      setSkills(
                        skillsList.filter((skill) =>
                          skill.toLowerCase().includes(value.toLowerCase())
                        )
                      )
                    }
                  />
                  <CommandList>
                    <CommandEmpty>No skills found.</CommandEmpty>
                    <CommandGroup>
                      {skills.map((skill) => (
                        <CommandItem
                          key={skill}
                          value={skill}
                          onSelect={() => {
                            handleSkillsChange(skill);
                            setOpen(false);
                          }}
                        >
                          {skill}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <select
                id="experience"
                name="experience"
                value={profile.experience || ""}
                onChange={(e) => handleExperienceChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Experience</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive Level">Executive Level</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                name="industry"
                value={profile.industry || ""}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                name="portfolio_url"
                value={profile.portfolio_url || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Tell us more about your preferences and interests.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Preferred Industries</Label>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Switch
                    id={`industry-${industry}`}
                    checked={profile.preferred_industries?.includes(industry) || false}
                    onCheckedChange={() => handlePreferredIndustriesChange(industry)}
                  />
                  <Label htmlFor={`industry-${industry}`}>{industry}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preferred Project Types</Label>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((projectType) => (
                <div key={projectType} className="flex items-center space-x-2">
                  <Switch
                    id={`projectType-${projectType}`}
                    checked={profile.preferred_project_types?.includes(projectType) || false}
                    onCheckedChange={() => handlePreferredProjectTypesChange(projectType)}
                  />
                  <Label htmlFor={`projectType-${projectType}`}>{projectType}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Looking For</Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="lookingFor-cofounder"
                  checked={profile.looking_for?.includes("Co-founder") || false}
                  onCheckedChange={() => handleLookingForChange("Co-founder")}
                />
                <Label htmlFor="lookingFor-cofounder">Co-founder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="lookingFor-developer"
                  checked={profile.looking_for?.includes("Developer") || false}
                  onCheckedChange={() => handleLookingForChange("Developer")}
                />
                <Label htmlFor="lookingFor-developer">Developer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="lookingFor-designer"
                  checked={profile.looking_for?.includes("Designer") || false}
                  onCheckedChange={() => handleLookingForChange("Designer")}
                />
                <Label htmlFor="lookingFor-designer">Designer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="lookingFor-marketing"
                  checked={profile.looking_for?.includes("Marketing") || false}
                  onCheckedChange={() => handleLookingForChange("Marketing")}
                />
                <Label htmlFor="lookingFor-marketing">Marketing</Label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <select
                id="availability"
                name="availability"
                value={profile.availability || ""}
                onChange={(e) => handleAvailabilityChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Availability</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Contract">Contract</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingPreference">Meeting Preference</Label>
              <select
                id="meetingPreference"
                name="meetingPreference"
                value={profile.meeting_preference || ""}
                onChange={(e) => handleMeetingPreferenceChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Meeting Preference</option>
                <option value="In-Person">In-Person</option>
                <option value="Virtual">Virtual</option>
                <option value="No Preference">No Preference</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload your profile photo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProfilePhotoUpload
            userId={user?.id || ""}
            currentPhotoUrl={photoURL}
            onPhotoUpdate={handlePhotoUpdate}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSaveProfile} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
