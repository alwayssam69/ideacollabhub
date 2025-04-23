
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { INDUSTRY_OPTIONS } from "@/constants/onboardingOptions";
import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/types/onboarding";
import { SKILLS_BY_INDUSTRY } from "@/constants/skillsData";

interface SkillsSectionProps {
  form: UseFormReturn<OnboardingFormData>;
  selectedIndustry: string;
  availableSkills: string[];
  onIndustryChange: (value: string) => void;
}

export const SkillsSection = ({ 
  form, 
  selectedIndustry, 
  availableSkills, 
  onIndustryChange 
}: SkillsSectionProps) => {
  return (
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
                onIndustryChange(value);
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
    </div>
  );
};
