
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGE_OPTIONS } from "@/constants/onboardingOptions";
import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/types/onboarding";

interface BasicInfoSectionProps {
  form: UseFormReturn<OnboardingFormData>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-300">Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Your full name"
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
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-300">I am a...</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-11 bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 border-slate-700">
                {STAGE_OPTIONS.map((option) => (
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
  );
};
