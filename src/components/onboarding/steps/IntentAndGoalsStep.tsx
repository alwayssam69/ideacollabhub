
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { PURPOSE_OPTIONS } from "@/constants/onboardingOptions";

const INTENT_OPTIONS = [
  "Build my own startup",
  "Join as co-founder",
  "Collaborate on side projects",
  "Network with like-minded people",
  "Find a technical co-founder",
  "Find a business co-founder",
  "Mentor others",
  "Be mentored",
  "Invest in startups",
  "Find job opportunities",
  "Explore acquisition targets",
  "Build my portfolio"
];

export const IntentAndGoalsStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  const [newGoal, setNewGoal] = useState("");
  
  const toggleIntent = (intent: string) => {
    const currentGoals = formData.goals || [];
    if (currentGoals.includes(intent)) {
      onUpdate({ goals: currentGoals.filter(g => g !== intent) });
    } else {
      onUpdate({ goals: [...currentGoals, intent] });
    }
  };
  
  const toggleLookingFor = (type: string) => {
    const currentLookingFor = formData.looking_for;
    if (currentLookingFor.includes(type)) {
      onUpdate({ looking_for: currentLookingFor.filter(t => t !== type) });
    } else {
      onUpdate({ looking_for: [...currentLookingFor, type] });
    }
  };
  
  const addGoal = () => {
    if (newGoal && !(formData.goals || []).includes(newGoal)) {
      onUpdate({ goals: [...(formData.goals || []), newGoal] });
      setNewGoal("");
    }
  };
  
  const removeGoal = (goal: string) => {
    onUpdate({
      goals: (formData.goals || []).filter(g => g !== goal)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Intent & Goals</h2>
      
      <FormField
        name="goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>I want to... (Select all that apply)</FormLabel>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {INTENT_OPTIONS.map(intent => (
                <div key={intent} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`intent-${intent}`} 
                    checked={(formData.goals || []).includes(intent)} 
                    onCheckedChange={() => toggleIntent(intent)}
                    className="bg-slate-800 border-slate-600"
                  />
                  <label 
                    htmlFor={`intent-${intent}`}
                    className="text-sm text-slate-200 cursor-pointer"
                  >
                    {intent}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {(formData.goals || []).filter(goal => !INTENT_OPTIONS.includes(goal)).map(goal => (
                  <Badge key={goal} variant="secondary" className="px-3 py-1">
                    {goal}
                    <button 
                      type="button" 
                      className="ml-2" 
                      onClick={() => removeGoal(goal)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <FormControl>
                  <Input
                    placeholder="Add a custom goal"
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    className="bg-slate-800 text-white border-slate-700"
                  />
                </FormControl>
                <button 
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="looking_for"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Looking for... (Select all that apply)</FormLabel>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-2 gap-2">
              {PURPOSE_OPTIONS.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`looking-${type}`} 
                    checked={formData.looking_for.includes(type)} 
                    onCheckedChange={() => toggleLookingFor(type)}
                    className="bg-slate-800 border-slate-600"
                  />
                  <label 
                    htmlFor={`looking-${type}`}
                    className="text-sm text-slate-200 cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="long_term_goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Long-term Goal (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="What's your ultimate professional goal?"
                value={formData.long_term_goal || ""}
                onChange={e => onUpdate({ long_term_goal: e.target.value })}
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
