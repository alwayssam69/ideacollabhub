
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_STAGE_OPTIONS } from "@/constants/onboardingOptions";
import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/types/onboarding";

interface ProjectInfoSectionProps {
  form: UseFormReturn<OnboardingFormData>;
  show: boolean;
}

export const ProjectInfoSection = ({ form, show }: ProjectInfoSectionProps) => {
  if (!show) return null;

  return (
    <div className="grid grid-cols-1 gap-8">
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
    </div>
  );
};
