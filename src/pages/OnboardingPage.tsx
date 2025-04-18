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

// Constants for dropdown options
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
const professionalInfoSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  purposes: z.array(z.string()).min(1, "Please select at least one purpose"),
  availability: z.string().min(1, "Availability is required"),
  meetingPreference: z.string().min(1, "Meeting preference is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
});

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  const form = useForm<z.infer<typeof professionalInfoSchema>>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      industry: "",
      skills: [],
      purposes: [],
      availability: "",
      meetingPreference: "",
      bio: "",
    },
  });

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    form.setValue("industry", value);
    form.setValue("skills", []);
    
    // Update available skills based on selected industry
    setAvailableSkills(SKILLS_BY_INDUSTRY[value as keyof typeof SKILLS_BY_INDUSTRY] || []);
  };

  const onSubmit = async (data: z.infer<typeof professionalInfoSchema>) => {
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const profileData = {
        id: user.id,
        industry: data.industry,
        skills: data.skills,
        looking_for: data.purposes,
        availability: data.availability,
        meeting_preference: data.meetingPreference,
        bio: data.bio,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        preferred_industries: [data.industry],
        preferred_project_types: data.purposes,
        motivation: data.bio
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      toast.success("Profile completed successfully!");
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
                    name="purposes"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">What are you looking for?</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {PURPOSE_OPTIONS.map((purpose) => (
                            <FormField
                              key={purpose}
                              control={form.control}
                              name="purposes"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Availability</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                                <SelectValue placeholder="Select your availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {AVAILABILITY_OPTIONS.map((option) => (
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
                      name="meetingPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Meeting Preference</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                                <SelectValue placeholder="Select your preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {MEETING_PREFERENCE_OPTIONS.map((option) => (
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
                  </div>

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
