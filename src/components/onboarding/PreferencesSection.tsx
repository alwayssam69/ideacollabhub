
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PURPOSE_OPTIONS } from "@/constants/onboardingOptions";
import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/types/onboarding";

interface PreferencesSectionProps {
  form: UseFormReturn<OnboardingFormData>;
}

export const PreferencesSection = ({ form }: PreferencesSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <FormField
        control={form.control}
        name="looking_for"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-300">What are you looking for?</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PURPOSE_OPTIONS.map((purpose) => (
                <FormField
                  key={purpose}
                  control={form.control}
                  name="looking_for"
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-300">LinkedIn URL (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://linkedin.com/in/yourusername"
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
          name="portfolio_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-300">Portfolio URL (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://yourportfolio.com"
                  className="h-11 bg-slate-800 border-slate-700 text-slate-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
