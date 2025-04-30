
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingFormData } from "@/types/onboarding";
import { useProfile } from "@/hooks/useProfile";
import { MultiStepForm } from "@/components/onboarding/MultiStepForm";

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { updateProfile, profile } = useProfile();

  const initialFormData: OnboardingFormData = {
    fullName: profile?.full_name || "",
    role: profile?.role || "",
    city: profile?.location || "",
    linkedin_url: profile?.linkedin_url || "",
    portfolio_url: profile?.portfolio_url || "",
    experience: profile?.experience || "",
    education: profile?.education || "",
    work_history: profile?.work_history || "",
    bio: profile?.bio || "",
    industry: profile?.industry || "",
    skills: profile?.skills || [],
    secondary_skills: profile?.secondary_skills || [],
    tools: profile?.tools || [],
    availability: profile?.availability || "",
    work_style: profile?.work_style || "",
    location_preference: profile?.location_preference || "",
    stage: profile?.stage || "",
    preferred_project_stages: profile?.preferred_project_stages || [],
    looking_for: profile?.looking_for || [],
    goals: profile?.goals || [],
    long_term_goal: profile?.long_term_goal || "",
    past_startup_experience: profile?.past_startup_experience || false,
    willing_to_relocate: profile?.willing_to_relocate || false,
    core_values: profile?.core_values || [],
    motivation: profile?.motivation || "",
    project_stage: profile?.project_stage || "",
    project_description: profile?.project_description || "",
    preferred_industries: profile?.preferred_industries || [],
    preferred_project_types: profile?.preferred_project_types || [],
    onboarding_completed: profile?.onboarding_completed || false,
  };

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }
  }, [profile]);

  const handleSave = async (data: OnboardingFormData) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      console.log("Saving profile data:", data);

      // Map form data to profile schema
      const { error } = await updateProfile({
        full_name: data.fullName,
        role: data.role,
        location: data.city,
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        experience: data.experience,
        education: data.education,
        work_history: data.work_history,
        bio: data.bio,
        industry: data.industry,
        skills: data.skills,
        secondary_skills: data.secondary_skills,
        tools: data.tools,
        availability: data.availability,
        work_style: data.work_style,
        location_preference: data.location_preference,
        stage: data.stage,
        preferred_project_stages: data.preferred_project_stages,
        looking_for: data.looking_for,
        goals: data.goals,
        long_term_goal: data.long_term_goal,
        past_startup_experience: data.past_startup_experience,
        willing_to_relocate: data.willing_to_relocate,
        core_values: data.core_values,
        motivation: data.motivation,
        project_stage: data.project_stage,
        project_description: data.project_description,
        preferred_industries: data.preferred_industries || [data.industry],
        preferred_project_types: data.preferred_project_types || data.looking_for,
        // Only set onboarding_completed to true when explicitly requested
        ...(data.onboarding_completed !== undefined && { onboarding_completed: data.onboarding_completed }),
      });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  };

  const handleComplete = () => {
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-300">Let's get to know you better to find the perfect matches</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6 pb-6">
            <MultiStepForm 
              initialData={initialFormData} 
              onSave={handleSave} 
              onComplete={handleComplete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
