
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingStepProps } from "@/types/onboarding";
import { PROJECT_STAGE_OPTIONS, STAGE_OPTIONS } from "@/constants/onboardingOptions";

const AVAILABILITY_OPTIONS = [
  "<5 hours/week",
  "5-10 hours/week",
  "10-20 hours/week",
  "20-30 hours/week",
  "Full-time",
  "Flexible"
];

const WORK_STYLE_OPTIONS = [
  "Async",
  "Sync",
  "Flexible",
  "Morning focused",
  "Evening focused",
  "Weekend warrior"
];

const LOCATION_PREFERENCE_OPTIONS = [
  "Remote only",
  "Hybrid",
  "In-person only",
  "Remote but willing to travel occasionally",
  "No preference"
];

const PROJECT_STAGES_OPTIONS = [
  "Idea",
  "MVP",
  "Product-market fit",
  "Scaling",
  "Fundraising",
  "Profitable",
  "Enterprise",
  "Acquisition"
];

export const WorkPreferencesStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  const toggleProjectStage = (stage: string) => {
    const currentStages = formData.preferred_project_stages || [];
    if (currentStages.includes(stage)) {
      onUpdate({ preferred_project_stages: currentStages.filter(s => s !== stage) });
    } else {
      onUpdate({ preferred_project_stages: [...currentStages, stage] });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Work Preferences</h2>
      
      <FormField
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weekly Availability</FormLabel>
            <Select
              value={formData.availability || ""}
              onValueChange={value => onUpdate({ availability: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {AVAILABILITY_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="hover:bg-slate-700">
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
        name="work_style"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Work Style</FormLabel>
            <Select
              value={formData.work_style || ""}
              onValueChange={value => onUpdate({ work_style: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your work style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {WORK_STYLE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="hover:bg-slate-700">
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
        name="location_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remote or In-Person Preference</FormLabel>
            <Select
              value={formData.location_preference || ""}
              onValueChange={value => onUpdate({ location_preference: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your location preference" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {LOCATION_PREFERENCE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="hover:bg-slate-700">
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
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Current Stage</FormLabel>
            <Select
              value={formData.stage}
              onValueChange={value => onUpdate({ stage: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your current stage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {STAGE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="hover:bg-slate-700">
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
        name="preferred_project_stages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Interested Startup/Project Stages</FormLabel>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-2 gap-2">
              {PROJECT_STAGES_OPTIONS.map(stage => (
                <div key={stage} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`stage-${stage}`} 
                    checked={(formData.preferred_project_stages || []).includes(stage)} 
                    onCheckedChange={() => toggleProjectStage(stage)}
                    className="bg-slate-800 border-slate-600"
                  />
                  <label 
                    htmlFor={`stage-${stage}`}
                    className="text-sm text-slate-200 cursor-pointer"
                  >
                    {stage}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {formData.stage === "Founder" && (
        <FormField
          name="project_stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Project Stage</FormLabel>
              <Select
                value={formData.project_stage || ""}
                onValueChange={value => onUpdate({ project_stage: value })}
              >
                <FormControl>
                  <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                    <SelectValue placeholder="Select your project stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 text-white border-slate-700">
                  {PROJECT_STAGE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option} className="hover:bg-slate-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
