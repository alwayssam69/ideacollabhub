
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingStepProps } from "@/types/onboarding";

const CORE_VALUES = [
  "Execution",
  "Empathy",
  "Creativity",
  "Vision",
  "Persistence",
  "Adaptability",
  "Leadership",
  "Collaboration",
  "Communication",
  "Innovation",
  "Integrity",
  "Quality",
  "Work-Life Balance",
  "Growth Mindset",
  "Accountability"
];

export const PersonalityAndExperienceStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  const toggleCoreValue = (value: string) => {
    const currentValues = formData.core_values || [];
    if (currentValues.includes(value)) {
      onUpdate({ core_values: currentValues.filter(v => v !== value) });
    } else {
      onUpdate({ core_values: [...currentValues, value] });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Personality & Experience</h2>
      
      <FormField
        name="past_startup_experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Past Startup Experience?</FormLabel>
            <Select
              value={formData.past_startup_experience !== undefined 
                ? String(formData.past_startup_experience) 
                : ""}
              onValueChange={value => onUpdate({ past_startup_experience: value === "true" })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="true" className="hover:bg-slate-700">Yes</SelectItem>
                <SelectItem value="false" className="hover:bg-slate-700">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="willing_to_relocate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Willing to Relocate?</FormLabel>
            <Select
              value={formData.willing_to_relocate !== undefined 
                ? String(formData.willing_to_relocate) 
                : ""}
              onValueChange={value => onUpdate({ willing_to_relocate: value === "true" })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="true" className="hover:bg-slate-700">Yes</SelectItem>
                <SelectItem value="false" className="hover:bg-slate-700">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="core_values"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Core Values (Select up to 5)</FormLabel>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {CORE_VALUES.map(value => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`value-${value}`} 
                    checked={(formData.core_values || []).includes(value)}
                    disabled={(formData.core_values || []).length >= 5 && !(formData.core_values || []).includes(value)}
                    onCheckedChange={() => toggleCoreValue(value)}
                    className="bg-slate-800 border-slate-600"
                  />
                  <label 
                    htmlFor={`value-${value}`}
                    className={`text-sm cursor-pointer ${
                      (formData.core_values || []).length >= 5 && 
                      !(formData.core_values || []).includes(value) ? 
                      'text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {value}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="motivation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What motivates you? (Optional)</FormLabel>
            <Select
              value={formData.motivation || ""}
              onValueChange={value => onUpdate({ motivation: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select what motivates you most" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="Impact" className="hover:bg-slate-700">Making an impact</SelectItem>
                <SelectItem value="Learning" className="hover:bg-slate-700">Continuous learning</SelectItem>
                <SelectItem value="Financial" className="hover:bg-slate-700">Financial freedom</SelectItem>
                <SelectItem value="Recognition" className="hover:bg-slate-700">Recognition & achievement</SelectItem>
                <SelectItem value="Freedom" className="hover:bg-slate-700">Autonomy & freedom</SelectItem>
                <SelectItem value="Challenge" className="hover:bg-slate-700">Intellectual challenge</SelectItem>
                <SelectItem value="Community" className="hover:bg-slate-700">Community & belonging</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
