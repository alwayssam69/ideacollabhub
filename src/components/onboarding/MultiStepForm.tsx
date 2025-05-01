import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingFormData } from "@/types/onboarding";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProfessionalBackgroundStep } from "./steps/ProfessionalBackgroundStep";
import { SkillsAndToolsStep } from "./steps/SkillsAndToolsStep";
import { WorkPreferencesStep } from "./steps/WorkPreferencesStep";
import { IntentAndGoalsStep } from "./steps/IntentAndGoalsStep";
import { PersonalityAndExperienceStep } from "./steps/PersonalityAndExperienceStep";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MultiStepFormProps {
  initialData: OnboardingFormData;
  onSave: (data: OnboardingFormData) => Promise<void>;
  onComplete: () => void;
}

export const MultiStepForm = ({ initialData, onSave, onComplete }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Define steps
  const steps = [
    { title: "Basic Info", component: BasicInfoStep },
    { title: "Professional Background", component: ProfessionalBackgroundStep },
    { title: "Skills & Tools", component: SkillsAndToolsStep },
    { title: "Work Preferences", component: WorkPreferencesStep },
    { title: "Intent & Goals", component: IntentAndGoalsStep },
    { title: "Personality & Experience", component: PersonalityAndExperienceStep },
  ];
  
  // Calculate progress percentage
  const progress = ((currentStep) / (steps.length - 1)) * 100;
  
  // Auto-save feature
  useEffect(() => {
    const handleAutoSave = async () => {
      if (Object.keys(formData).length > 0) {
        setIsSaving(true);
        try {
          await onSave(formData);
          console.log("Auto-saved form data");
        } catch (error) {
          console.error("Auto-save failed", error);
        } finally {
          setIsSaving(false);
        }
      }
    };
    
    // Clear previous timer if exists
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Set new timer for auto-save (3 seconds after last change)
    const timer = setTimeout(handleAutoSave, 3000);
    setAutoSaveTimer(timer);
    
    // Clean up timer
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData]);
  
  // Handle form updates
  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  // Handle next step
  const handleNext = async () => {
    // If we're at the last step, complete onboarding
    if (currentStep === steps.length - 1) {
      try {
        setIsSaving(true);
        // Create a copy of the form data with the onboarding_completed flag set
        const completedFormData = {
          ...formData,
          onboarding_completed: true
        };
        await onSave(completedFormData);
        onComplete();
        toast.success("Profile completed successfully!");
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        toast.error("Failed to save profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
      return;
    }
    
    // Check required fields at each step
    if (currentStep === 0) {
      if (!formData.fullName || !formData.role) {
        toast.error("Please fill in the required fields (Full Name and Role) before proceeding.");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.industry || formData.skills.length === 0) {
        toast.error("Please select an industry and at least one skill before proceeding.");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.stage) {
        toast.error("Please select your current stage before proceeding.");
        return;
      }
    } else if (currentStep === 4) {
      if (formData.looking_for.length === 0) {
        toast.error("Please select at least one option for what you're looking for.");
        return;
      }
    }
    
    // Save current step data
    try {
      setIsSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error("Failed to save form data:", error);
      toast.error("Failed to save changes. Please try again.");
      return;
    } finally {
      setIsSaving(false);
    }
    
    // Proceed to next step
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Render current step content
  const StepComponent = steps[currentStep].component;
  
  return (
    <div>
      {/* Progress bar and step indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm text-slate-400">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-700" />
      </div>
      
      {/* Step content */}
      <div className="mb-8">
        <StepComponent formData={formData} onUpdate={updateFormData} />
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSaving}
          className="bg-transparent border-slate-600 hover:bg-slate-700 text-slate-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Saving...
            </div>
          )}
          
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Complete
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
