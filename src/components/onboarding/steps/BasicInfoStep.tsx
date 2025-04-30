
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { OnboardingStepProps } from "@/types/onboarding";
import { useAuth } from "@/hooks/useAuth";

const ROLES = [
  "Frontend Developer", 
  "Backend Developer",
  "Full Stack Developer", 
  "UI/UX Designer", 
  "Product Manager", 
  "Founder", 
  "Student", 
  "Data Scientist", 
  "DevOps Engineer", 
  "QA Engineer",
  "Marketing Specialist",
  "Content Creator",
  "Business Analyst",
  "Consultant",
  "Sales Professional",
  "HR Specialist",
  "Other"
];

export const BasicInfoStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Basic Information</h2>
      
      <div className="flex flex-col items-center mb-8">
        <ProfilePhotoUpload
          userId={user?.id || ""}
          currentPhotoUrl={previewUrl}
          onPhotoUpdate={(url) => {
            setPreviewUrl(url);
            // We don't need to store the URL in form data as it's saved directly to storage
          }}
          size="lg"
        />
      </div>
      
      <FormField
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e => onUpdate({ fullName: e.target.value })}
                className="bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select
              value={formData.role}
              onValueChange={value => onUpdate({ role: value })}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {ROLES.map(role => (
                  <SelectItem key={role} value={role} className="hover:bg-slate-700">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input
                placeholder="San Francisco, CA"
                value={formData.city || ""}
                onChange={e => onUpdate({ city: e.target.value })}
                className="bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="linkedin_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn Profile (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin_url || ""}
                onChange={e => onUpdate({ linkedin_url: e.target.value })}
                className="bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="portfolio_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GitHub / Portfolio URL (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="https://github.com/yourusername"
                value={formData.portfolio_url || ""}
                onChange={e => onUpdate({ portfolio_url: e.target.value })}
                className="bg-slate-800 text-white border-slate-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
