
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { 
  STAGE_OPTIONS, 
  INDUSTRY_OPTIONS, 
  PURPOSE_OPTIONS, 
  PROJECT_STAGE_OPTIONS 
} from "@/constants/onboardingOptions";

const professionalInfoSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  stage: z.string().min(1, "Stage is required"),
  industry: z.string().min(1, "Industry is required"),
  role: z.string().min(1, "Role is required"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  looking_for: z.array(z.string()).min(1, "Please select at least one purpose"),
  project_stage: z.string().optional(),
  project_description: z.string().optional(),
  preferred_industries: z.array(z.string()).optional(),
  preferred_project_types: z.array(z.string()).optional(),
  bio: z.string().optional(),
  motivation: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  profilePhoto: z.instanceof(File).optional(),
});

// Set of skills based on selected industry
const SKILLS_BY_INDUSTRY = {
  "Technology": [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "Cybersecurity"
  ],
  "Healthcare": [
    "Medical Research",
    "Healthcare Administration",
    "Nursing",
    "Pharmaceuticals",
    "Telemedicine",
    "Medical Devices",
    "Patient Care"
  ],
  "Education": [
    "Teaching",
    "Curriculum Development",
    "Educational Technology",
    "School Administration",
    "Educational Psychology",
    "Special Education",
    "E-learning Development"
  ],
  "Finance": [
    "Financial Analysis",
    "Investment Banking",
    "Accounting",
    "Financial Planning",
    "Risk Management",
    "Fintech",
    "Insurance"
  ],
  "Marketing": [
    "Digital Marketing",
    "Content Marketing",
    "SEO/SEM",
    "Social Media Marketing",
    "Market Research",
    "Brand Management",
    "Email Marketing"
  ],
  "Design": [
    "Graphic Design",
    "Product Design",
    "UX/UI Design",
    "Industrial Design",
    "Brand Identity",
    "Web Design",
    "Animation"
  ],
  "Media & Entertainment": [
    "Film Production",
    "Music Production",
    "Game Development",
    "Photography",
    "Content Creation",
    "Social Media",
    "Digital Media"
  ],
  "E-commerce": [
    "Online Store Management",
    "Supply Chain",
    "Customer Service",
    "Digital Marketing",
    "Inventory Management",
    "Marketplace Integration",
    "User Experience"
  ],
  "Manufacturing": [
    "Production Management",
    "Quality Control",
    "Supply Chain",
    "Logistics",
    "Industrial Engineering",
    "Procurement",
    "Process Optimization"
  ],
  "Sustainability": [
    "Environmental Science",
    "Renewable Energy",
    "Sustainable Development",
    "Conservation",
    "Green Building",
    "Climate Policy",
    "Circular Economy"
  ],
  "Other": [
    "Project Management",
    "Business Development",
    "Human Resources",
    "Legal",
    "Customer Service",
    "Public Relations",
    "Consulting"
  ]
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<z.infer<typeof professionalInfoSchema>>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      fullName: "",
      stage: "",
      industry: "",
      role: "",
      skills: [],
      looking_for: [],
      project_stage: "",
      project_description: "",
      preferred_industries: [],
      preferred_project_types: [],
      bio: "",
      motivation: "",
      linkedin_url: "",
      portfolio_url: "",
      profilePhoto: undefined,
    },
  });

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    form.setValue("industry", value);
    form.setValue("skills", []);
    
    setAvailableSkills(SKILLS_BY_INDUSTRY[value as keyof typeof SKILLS_BY_INDUSTRY] || []);
  };

  const uploadProfilePhoto = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: z.infer<typeof professionalInfoSchema>) => {
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      let avatarUrl = "";
      if (data.profilePhoto) {
        avatarUrl = await uploadProfilePhoto(data.profilePhoto, user.id);
      }

      // Map form data to the profile structure expected by the database
      const profileData = {
        id: user.id,
        full_name: data.fullName,
        stage: data.stage,
        industry: data.industry,
        role: data.role,
        skills: data.skills,
        looking_for: data.looking_for,
        project_stage: data.project_stage,
        project_description: data.project_description,
        preferred_industries: data.preferred_industries || [data.industry],
        preferred_project_types: data.preferred_project_types || data.looking_for,
        bio: data.bio,
        motivation: data.motivation,
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        avatar_url: avatarUrl || undefined
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Profile completed successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to save profile: ${error.message}`
          : "Failed to save profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-300">Let's get to know you better to find the perfect matches</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-slate-900/50 backdrop-blur">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-xl font-semibold text-white">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your full name"
                            className="h-11 bg-slate-800 border-slate-700 text-slate-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePhoto"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel className="text-sm font-medium text-slate-300 mb-4">
                          Profile Photo
                        </FormLabel>
                        <ProfilePhotoUpload
                          userId={user?.id || ""}
                          currentPhotoUrl={previewUrl}
                          onPhotoUpdate={(url) => {
                            setPreviewUrl(url);
                            field.onChange(url);
                          }}
                          size="lg"
                        />
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">I am a...</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {STAGE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-slate-200 hover:bg-slate-700">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Industry</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleIndustryChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {INDUSTRY_OPTIONS.map((industry) => (
                              <SelectItem key={industry} value={industry} className="text-slate-200 hover:bg-slate-700">
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Your Role</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Software Developer, UX Designer, Marketing Manager"
                            className="h-11 bg-slate-800 border-slate-700 text-slate-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Skills</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {availableSkills.map((skill) => (
                            <FormField
                              key={skill}
                              control={form.control}
                              name="skills"
                              render={({ field }) => (
                                <FormItem
                                  key={skill}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, skill])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== skill
                                              )
                                            );
                                      }}
                                      className="border-slate-600 data-[state=checked]:bg-indigo-600"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal text-slate-300">
                                    {skill}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="looking_for"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">What are you looking for?</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {PURPOSE_OPTIONS.map((purpose) => (
                            <FormField
                              key={purpose}
                              control={form.control}
                              name="looking_for"
                              render={({ field }) => (
                                <FormItem
                                  key={purpose}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(purpose)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, purpose])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== purpose
                                              )
                                            );
                                      }}
                                      className="border-slate-600 data-[state=checked]:bg-indigo-600"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal text-slate-300">
                                    {purpose}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {form.watch("stage") === "Founder" && (
                    <>
                      <FormField
                        control={form.control}
                        name="project_stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-300">Project Stage</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                                  <SelectValue placeholder="Select your project stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {PROJECT_STAGE_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option} className="text-slate-200 hover:bg-slate-700">
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="project_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-300">Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your project or startup idea..."
                                className="min-h-[120px] resize-none bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-400" />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself, your experience, and what you're looking for..."
                            className="min-h-[120px] resize-none bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">LinkedIn URL (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://linkedin.com/in/yourusername"
                              className="h-11 bg-slate-800 border-slate-700 text-slate-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="portfolio_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Portfolio URL (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourportfolio.com"
                              className="h-11 bg-slate-800 border-slate-700 text-slate-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <CardFooter className="flex justify-end px-0 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
