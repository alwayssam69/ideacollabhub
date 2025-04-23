
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { OnboardingFormData } from "@/types/onboarding";
import { BasicInfoSection } from "@/components/onboarding/BasicInfoSection";
import { ProjectInfoSection } from "@/components/onboarding/ProjectInfoSection";
import { SkillsSection } from "@/components/onboarding/SkillsSection";
import { PreferencesSection } from "@/components/onboarding/PreferencesSection";
import { useProfile } from "@/hooks/useProfile";
import { SKILLS_BY_INDUSTRY } from "@/constants/skillsData";

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

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { updateProfile } = useProfile();

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

  const onSubmit = async (data: z.infer<typeof professionalInfoSchema>) => {
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Update profile in Supabase
      const { error } = await updateProfile({
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
      });

      if (error) throw error;

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
                <FormField
                  control={form.control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <div className="flex flex-col items-center mb-8">
                      <ProfilePhotoUpload
                        userId={user?.id || ""}
                        currentPhotoUrl={previewUrl}
                        onPhotoUpdate={(url) => {
                          setPreviewUrl(url);
                          field.onChange(url);
                        }}
                        size="lg"
                      />
                    </div>
                  )}
                />

                <BasicInfoSection form={form} />
                
                <SkillsSection 
                  form={form}
                  selectedIndustry={selectedIndustry}
                  availableSkills={availableSkills}
                  onIndustryChange={handleIndustryChange}
                />

                <ProjectInfoSection 
                  form={form}
                  show={form.watch("stage") === "Founder"}
                />

                <PreferencesSection form={form} />

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
