
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { OnboardingStepProps } from "@/types/onboarding";

const EXPERIENCE_OPTIONS = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years"
];

export const ProfessionalBackgroundStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Professional Background</h2>
      
      <FormField
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <Select
              value={formData.experience || ""}
              onValueChange={value => onUpdate({ experience: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {EXPERIENCE_OPTIONS.map(option => (
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
        name="education"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., BS in Computer Science, Stanford University"
                value={formData.education || ""}
                onChange={e => onUpdate({ education: e.target.value })}
                className="bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="work_history"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brief Work History (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Share your relevant work history"
                value={formData.work_history || ""}
                onChange={e => onUpdate({ work_history: e.target.value })}
                className="min-h-[120px] bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Bio (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write a short bio about yourself"
                value={formData.bio || ""}
                onChange={e => onUpdate({ bio: e.target.value })}
                className="min-h-[120px] bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
