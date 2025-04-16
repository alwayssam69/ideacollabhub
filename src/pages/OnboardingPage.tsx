
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
const AGE_OPTIONS = Array.from({ length: 23 }, (_, i) => i + 18);
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry"
];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Expert"];
const COLLABORATION_MODES = ["Remote", "In-person", "Hybrid"];
const PURPOSES = ["Co-founder", "Collaborators", "Freelance work", "Explore ideas", "Learning"];
const APP_PURPOSES = [
  "Contribute to cool ideas",
  "Hire collaborators",
  "Find co-founder",
  "General networking",
  "Collaborate on projects",
  "Upskill via real work"
];
const STARTUP_STAGES = ["Ideation", "PoC", "Prototype", "Revenue", "Scaling"];
const INDUSTRIES = [
  "Technology", "Healthcare", "Education", "Finance", "Retail", "Manufacturing",
  "Transportation", "Energy", "Agriculture", "Entertainment", "Food & Beverages",
  "Real Estate", "Travel & Tourism", "Media", "Other"
];
const FOCUS_AREAS = [
  "EdTech", "FinTech", "HealthTech", "AgriTech", "CleanTech", "FoodTech", 
  "RetailTech", "PropTech", "InsurTech", "LegalTech", "Other"
];

// Mock city data - in a real app, you'd use an API
const CITY_BY_STATE: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"],
  // Add more as needed
};

// Skills by industry - simplified version
const SKILLS_BY_INDUSTRY: Record<string, string[]> = {
  "Technology": ["Web Development", "Mobile Development", "Data Science", "UI/UX Design", "DevOps", "Cloud Computing", "Machine Learning", "Cybersecurity"],
  "Finance": ["Financial Analysis", "Investment Banking", "Risk Management", "Accounting", "Fintech", "Tax Planning", "Financial Modeling"],
  // Add more as needed
};

// Step schemas for the form
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().optional(),
});

const locationSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
});

const roleSchema = z.object({
  role: z.enum(["founder", "contributor", "both"], {
    required_error: "Please select your role",
  }),
});

const skillsSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
});

const preferencesSchema = z.object({
  preferredIndustries: z.array(z.string()).min(1, "Please select at least one industry"),
  preferredSkills: z.array(z.string()).min(1, "Please select at least one skill"),
  collaborationMode: z.string().min(1, "Collaboration mode is required"),
  ageRangeMin: z.string(),
  ageRangeMax: z.string(),
  locationPreferenceState: z.string().optional(),
  locationPreferenceCity: z.string().optional(),
});

const purposeSchema = z.object({
  lookingFor: z.array(z.string()).min(1, "Please select at least one option"),
  appPurpose: z.array(z.string()).min(1, "Please select at least one purpose"),
  startupStage: z.string().optional(),
  focusArea: z.string().optional(),
  subSector: z.string().optional(),
});

const bioSchema = z.object({
  oneLiner: z.string().min(1, "One-line bio is required"),
  detailedBio: z.string().optional(),
  helpOthers: z.boolean().optional(),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(7);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedPreferredIndustry, setSelectedPreferredIndustry] = useState("");
  const [availablePreferredSkills, setAvailablePreferredSkills] = useState<string[]>([]);

  // Create forms for each step
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
    },
  });

  const locationForm = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      state: "",
      city: "",
    },
  });

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: "both",
    },
  });

  const skillsForm = useForm<z.infer<typeof skillsSchema>>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      industry: "",
      skills: [],
      experienceLevel: "",
      yearsOfExperience: "",
    },
  });

  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredIndustries: [],
      preferredSkills: [],
      collaborationMode: "",
      ageRangeMin: "18",
      ageRangeMax: "40",
      locationPreferenceState: "",
      locationPreferenceCity: "",
    },
  });

  const purposeForm = useForm<z.infer<typeof purposeSchema>>({
    resolver: zodResolver(purposeSchema),
    defaultValues: {
      lookingFor: [],
      appPurpose: [],
      startupStage: "",
      focusArea: "",
      subSector: "",
    },
  });

  const bioForm = useForm<z.infer<typeof bioSchema>>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      oneLiner: "",
      detailedBio: "",
      helpOthers: false,
      linkedinUrl: "",
      portfolioUrl: "",
    },
  });

  // Handle state selection change to update cities
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    locationForm.setValue("state", value);
    locationForm.setValue("city", "");
  };

  // Handle industry selection change to update skills
  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    skillsForm.setValue("industry", value);
    skillsForm.setValue("skills", []);
    
    // Update available skills based on selected industry
    setAvailableSkills(SKILLS_BY_INDUSTRY[value] || []);
  };

  // Handle preferred industry selection to update preferred skills
  const handlePreferredIndustryChange = (value: string) => {
    setSelectedPreferredIndustry(value);
    
    // We're managing a multi-select for preferred industries, so we need to
    // get the current value first
    const currentPreferredIndustries = preferencesForm.getValues("preferredIndustries");
    
    // If the value is already in the array, remove it, otherwise add it
    let newPreferredIndustries: string[];
    if (currentPreferredIndustries.includes(value)) {
      newPreferredIndustries = currentPreferredIndustries.filter(i => i !== value);
    } else {
      newPreferredIndustries = [...currentPreferredIndustries, value];
    }
    
    preferencesForm.setValue("preferredIndustries", newPreferredIndustries);
    
    // Update available preferred skills based on selected industries
    const allSkills = newPreferredIndustries.flatMap(industry => 
      SKILLS_BY_INDUSTRY[industry] || []
    );
    setAvailablePreferredSkills([...new Set(allSkills)]);
    
    // Reset preferred skills if no industries are selected
    if (newPreferredIndustries.length === 0) {
      preferencesForm.setValue("preferredSkills", []);
    }
  };

  // Handle form submission for each step
  const handleStepSubmit = (data: any) => {
    setFormData(prevData => ({ ...prevData, ...data }));
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  // Handle final form submission
  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }

    const finalData = { ...formData, ...bioForm.getValues() };
    setIsSubmitting(true);

    try {
      // Convert the data structure to match our database schema
      const profileData = {
        id: user.id,
        full_name: finalData.fullName,
        age: parseInt(finalData.age),
        gender: finalData.gender,
        location: `${finalData.city}, ${finalData.state}`,
        role: finalData.role,
        industry: finalData.industry,
        skills: finalData.skills,
        experience_level: finalData.experienceLevel,
        years_of_experience: parseInt(finalData.yearsOfExperience),
        preferred_industries: finalData.preferredIndustries,
        preferred_skills: finalData.preferredSkills,
        collaboration_mode: finalData.collaborationMode,
        age_range_preference: `${finalData.ageRangeMin}-${finalData.ageRangeMax}`,
        location_preference: finalData.locationPreferenceState ? 
          `${finalData.locationPreferenceCity}, ${finalData.locationPreferenceState}` : null,
        looking_for: finalData.lookingFor.join(", "),
        app_purpose: finalData.appPurpose.join(", "),
        startup_stage: finalData.startupStage,
        focus_area: finalData.focusArea,
        sub_sector: finalData.subSector,
        bio: finalData.oneLiner,
        detailed_bio: finalData.detailedBio,
        help_others: finalData.helpOthers,
        linkedin_url: finalData.linkedinUrl,
        portfolio_url: finalData.portfolioUrl,
        onboarding_completed: true
      };

      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast.success("Onboarding complete!", {
        description: "Your profile has been successfully created.",
      });

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...personalInfoForm}>
            <form onSubmit={personalInfoForm.handleSubmit(handleStepSubmit)} className="space-y-6">
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
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your age" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGE_OPTIONS.map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age}
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          </Form>
        );
      case 2:
        return (
          <Form {...locationForm}>
            <form onSubmit={locationForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={locationForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={handleStateChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={locationForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedState}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedState ? "Select your city" : "Select a state first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(CITY_BY_STATE[selectedState] || []).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        );
      case 3:
        return (
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Who Are You?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="founder" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            I have a project/startup idea
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="contributor" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            I want to contribute
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="both" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            I'm open to both
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        );
      case 4:
        return (
          <Form {...skillsForm}>
            <form onSubmit={skillsForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={skillsForm.control}
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
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={skillsForm.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Skills</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select skills related to your industry
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {availableSkills.map((skill) => (
                        <FormField
                          key={skill}
                          control={skillsForm.control}
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
                                      const newValue = checked
                                        ? [...field.value, skill]
                                        : field.value?.filter((s) => s !== skill);
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
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
              <FormField
                control={skillsForm.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={skillsForm.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="50" placeholder="Enter years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        );
      case 5:
        return (
          <Form {...preferencesForm}>
            <form onSubmit={preferencesForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={preferencesForm.control}
                name="preferredIndustries"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Preferred Industries</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select industries you're interested in working with
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {INDUSTRIES.map((industry) => (
                        <FormField
                          key={industry}
                          control={preferencesForm.control}
                          name="preferredIndustries"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={industry}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(industry)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, industry]
                                        : field.value?.filter((i) => i !== industry);
                                      field.onChange(newValue);
                                      if (checked) {
                                        handlePreferredIndustryChange(industry);
                                      } else {
                                        handlePreferredIndustryChange(industry);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {industry}
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
                name="preferredSkills"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Preferred Skills</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select skills you're looking for in collaborators
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {availablePreferredSkills.map((skill) => (
                        <FormField
                          key={skill}
                          control={preferencesForm.control}
                          name="preferredSkills"
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
                                      const newValue = checked
                                        ? [...field.value, skill]
                                        : field.value?.filter((s) => s !== skill);
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
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
              <FormField
                control={preferencesForm.control}
                name="collaborationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collaboration Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select collaboration mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLLABORATION_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={preferencesForm.control}
                  name="ageRangeMin"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Age Range (Min)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Min age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGE_OPTIONS.map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age}
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
                  name="ageRangeMax"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Age Range (Max)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Max age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGE_OPTIONS.map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={preferencesForm.control}
                name="locationPreferenceState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Preference - State (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        preferencesForm.setValue("locationPreferenceCity", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
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
                name="locationPreferenceCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Preference - City (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!preferencesForm.watch("locationPreferenceState")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            preferencesForm.watch("locationPreferenceState") 
                              ? "Select preferred city" 
                              : "Select a state first"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(CITY_BY_STATE[preferencesForm.watch("locationPreferenceState")] || []).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        );
      case 6:
        return (
          <Form {...purposeForm}>
            <form onSubmit={purposeForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={purposeForm.control}
                name="lookingFor"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">What are you looking for?</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select all that apply
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {PURPOSES.map((purpose) => (
                        <FormField
                          key={purpose}
                          control={purposeForm.control}
                          name="lookingFor"
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
                                      const newValue = checked
                                        ? [...field.value, purpose]
                                        : field.value?.filter((p) => p !== purpose);
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
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
                control={purposeForm.control}
                name="appPurpose"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Purpose of using this app</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select all that apply
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
                      {APP_PURPOSES.map((purpose) => (
                        <FormField
                          key={purpose}
                          control={purposeForm.control}
                          name="appPurpose"
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
                                      const newValue = checked
                                        ? [...field.value, purpose]
                                        : field.value?.filter((p) => p !== purpose);
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
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
                control={purposeForm.control}
                name="startupStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage of Startup (if applicable)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select startup stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STARTUP_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={purposeForm.control}
                name="focusArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Area (if applicable)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select focus area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FOCUS_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={purposeForm.control}
                name="subSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-sector (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sub-sector" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        );
      case 7:
        return (
          <Form {...bioForm}>
            <form onSubmit={bioForm.handleSubmit(handleStepSubmit)} className="space-y-6">
              <FormField
                control={bioForm.control}
                name="oneLiner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Line Bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe yourself in one line" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bioForm.control}
                name="detailedBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell others more about yourself, your background, and what you're looking for"
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bioForm.control}
                name="helpOthers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I'm interested in mentoring or helping others
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={bioForm.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bioForm.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing Onboarding...
                    </>
                  ) : (
                    "Complete Onboarding"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        );
      default:
        return null;
    }
  };

  // Progress bar calculation
  const progress = (currentStep / totalSteps) * 100;

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
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepForm()}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep
                    ? "bg-primary"
                    : index + 1 < currentStep
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
