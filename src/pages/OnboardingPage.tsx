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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { OnboardingFormData } from '@/types/onboarding';

// Constants for dropdown options
const STAGE_OPTIONS = [
  "College Student", 
  "Drop Year", 
  "12th Pass", 
  "Preparing for Exams", 
  "Not in College Yet", 
  "Professional"
];
const INDUSTRY_OPTIONS = [
  "Technology",
  "Education",
  "Healthcare",
  "Finance",
  "Marketing",
  "Design",
  "Media",
  "Entertainment",
  "Manufacturing",
  "Retail",
  "Other"
];
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
  "Education": [
    "Teaching",
    "Curriculum Development",
    "Educational Technology",
    "School Administration",
    "Educational Psychology",
    "Special Education",
    "E-learning Development"
  ],
  // Add other industries as needed
};

const PURPOSE_OPTIONS = [
  "Join Projects",
  "Find Mentor",
  "Startup Team",
  "General Networking",
  "Learning Opportunities",
  "Freelance Work"
];

const AVAILABILITY_OPTIONS = [
  "Weekdays",
  "Weekends",
  "Evenings",
  "Flexible",
  "Limited Availability"
];

const MEETING_PREFERENCE_OPTIONS = [
  "Virtual",
  "In-Person",
  "Either"
];

// Step schemas
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  stage: z.string().min(1, "Current stage is required"),
  location: z.string().min(1, "Location is required"),
});

const professionalInfoSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
});

const preferencesSchema = z.object({
  purposes: z.array(z.string()).min(1, "Please select at least one purpose"),
  availability: z.string().min(1, "Availability is required"),
  meetingPreference: z.string().min(1, "Meeting preference is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
});

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Create forms for each step
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || "",
      stage: "",
      location: "",
    },
  });

  const professionalInfoForm = useForm<z.infer<typeof professionalInfoSchema>>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      industry: "",
      skills: [],
    },
  });

  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      purposes: [],
      availability: "",
      meetingPreference: "",
      bio: "",
    },
  });

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    professionalInfoForm.setValue("industry", value);
    professionalInfoForm.setValue("skills", []);
    
    // Update available skills based on selected industry
    setAvailableSkills(SKILLS_BY_INDUSTRY[value as keyof typeof SKILLS_BY_INDUSTRY] || []);
  };

  // Handle step submission
  const handlePersonalInfoSubmit = (data: z.infer<typeof personalInfoSchema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleProfessionalInfoSubmit = (data: z.infer<typeof professionalInfoSchema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handlePreferencesSubmit = async (data: z.infer<typeof preferencesSchema>) => {
    const finalData = { ...formData, ...data };
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw fetchError;
      }

      const profileData = {
        id: user.id,
        full_name: finalData.fullName,
        stage: finalData.stage,
        location: finalData.location,
        industry: finalData.industry,
        skills: finalData.skills,
        looking_for: finalData.purposes, // Now correctly handled as array
        availability: finalData.availability,
        meeting_preference: finalData.meetingPreference,
        bio: finalData.bio,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        project_stage: finalData.stage,
        preferred_industries: [finalData.industry],
        preferred_project_types: finalData.purposes,
        motivation: finalData.bio
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        error = updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        error = insertError;
      }

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      toast.success("Profile saved successfully!");
      navigate("/dashboard");
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

  // Calculate progress percentage
  const progress = (step / 3) * 100;

  return (
    <div className="container max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <div className="w-full bg-muted rounded-full h-2.5 mt-6">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Form {...personalInfoForm}>
              <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                <FormField
                  control={personalInfoForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalInfoForm.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAGE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalInfoForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city, state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Continue</Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...professionalInfoForm}>
              <form onSubmit={professionalInfoForm.handleSubmit(handleProfessionalInfoSubmit)} className="space-y-6">
                <FormField
                  control={professionalInfoForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={handleIndustryChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={professionalInfoForm.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Skills</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSkills.map((skill) => (
                          <FormField
                            key={skill}
                            control={professionalInfoForm.control}
                            name="skills"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={skill}
                                  className="flex flex-row items-start space-x-3 space-y-0"
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
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {skill}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          )}

          {step === 3 && (
            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                <FormField
                  control={preferencesForm.control}
                  name="purposes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Purpose</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          What are you looking for?
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {PURPOSE_OPTIONS.map((purpose) => (
                          <FormField
                            key={purpose}
                            control={preferencesForm.control}
                            name="purposes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={purpose}
                                  className="flex flex-row items-start space-x-3 space-y-0"
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
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {purpose}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="meetingPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Preference</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        {MEETING_PREFERENCE_OPTIONS.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About You</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself, your background, interests, and what you hope to achieve"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Onboarding"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-2 h-2 rounded-full ${
                  step === stepNumber
                    ? "bg-primary"
                    : step > stepNumber
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              ></div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
