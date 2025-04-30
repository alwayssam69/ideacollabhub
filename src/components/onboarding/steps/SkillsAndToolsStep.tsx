
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { INDUSTRY_OPTIONS } from "@/constants/onboardingOptions";
import { SKILLS_BY_INDUSTRY } from "@/constants/skillsData";

const TOOLS = [
  "Figma", "Sketch", "Adobe XD", "VS Code", "IntelliJ", "Notion", 
  "Slack", "GitHub", "GitLab", "JIRA", "Confluence", "Asana", 
  "Trello", "Miro", "Webflow", "WordPress", "AWS", "GCP", 
  "Azure", "Docker", "Kubernetes", "Postman", "Terminal"
];

export const SkillsAndToolsStep = ({ formData, onUpdate }: OnboardingStepProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState(formData.industry || "");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newSecondarySkill, setNewSecondarySkill] = useState("");

  useEffect(() => {
    if (selectedIndustry) {
      setAvailableSkills(SKILLS_BY_INDUSTRY[selectedIndustry as keyof typeof SKILLS_BY_INDUSTRY] || []);
    }
  }, [selectedIndustry]);

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    onUpdate({ industry: value });
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      onUpdate({ skills: [...formData.skills, newSkill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    onUpdate({ skills: formData.skills.filter(s => s !== skill) });
  };

  const addSecondarySkill = () => {
    const secondarySkills = formData.secondary_skills || [];
    if (newSecondarySkill && !secondarySkills.includes(newSecondarySkill)) {
      onUpdate({ secondary_skills: [...secondarySkills, newSecondarySkill] });
      setNewSecondarySkill("");
    }
  };

  const removeSecondarySkill = (skill: string) => {
    onUpdate({ 
      secondary_skills: (formData.secondary_skills || []).filter(s => s !== skill) 
    });
  };

  const toggleTool = (tool: string) => {
    const currentTools = formData.tools || [];
    if (currentTools.includes(tool)) {
      onUpdate({ tools: currentTools.filter(t => t !== tool) });
    } else {
      onUpdate({ tools: [...currentTools, tool] });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Skills & Tools</h2>
      
      <FormField
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <Select
              value={selectedIndustry}
              onValueChange={handleIndustryChange}
            >
              <FormControl>
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {INDUSTRY_OPTIONS.map(industry => (
                  <SelectItem key={industry} value={industry} className="hover:bg-slate-700">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Skills</FormLabel>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="px-3 py-1">
                  {skill}
                  <button 
                    type="button" 
                    className="ml-2" 
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex space-x-2">
                <FormControl>
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="bg-slate-800 text-white border-slate-700"
                  />
                </FormControl>
                <button 
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>

              <Select
                onValueChange={value => {
                  setNewSkill(value);
                  setTimeout(() => addSkill(), 100);
                }}
              >
                <SelectTrigger className="bg-slate-800 text-white border-slate-700">
                  <SelectValue placeholder="Choose from list" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 max-h-[200px]">
                  {availableSkills.map(skill => (
                    <SelectItem key={skill} value={skill} className="hover:bg-slate-700">
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="secondary_skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secondary Skills (Optional)</FormLabel>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.secondary_skills || []).map(skill => (
                <Badge key={skill} variant="outline" className="px-3 py-1">
                  {skill}
                  <button 
                    type="button" 
                    className="ml-2" 
                    onClick={() => removeSecondarySkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <FormControl>
                <Input
                  placeholder="Add a secondary skill"
                  value={newSecondarySkill}
                  onChange={e => setNewSecondarySkill(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSecondarySkill())}
                  className="bg-slate-800 text-white border-slate-700"
                />
              </FormControl>
              <button 
                type="button"
                onClick={addSecondarySkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        name="tools"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tools Used</FormLabel>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {TOOLS.map(tool => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tool-${tool}`} 
                    checked={(formData.tools || []).includes(tool)} 
                    onCheckedChange={() => toggleTool(tool)}
                    className="bg-slate-800 border-slate-600"
                  />
                  <label 
                    htmlFor={`tool-${tool}`}
                    className="text-sm text-slate-200 cursor-pointer"
                  >
                    {tool}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
