
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Filter, ChevronDown } from "lucide-react";

interface FilterDropdownsProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedIndustry: string | null;
  setSelectedIndustry: (industry: string | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  selectedSkill: string | null;
  setSelectedSkill: (skill: string | null) => void;
}

export function FilterDropdowns({
  selectedCategory,
  setSelectedCategory,
  selectedIndustry,
  setSelectedIndustry,
  selectedLocation,
  setSelectedLocation,
  selectedSkill,
  setSelectedSkill,
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all hover:scale-105">
            <Filter className="h-4 w-4 mr-2" />
            Project Type
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
          <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Types</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedCategory("startup")}>Startup Idea</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedCategory("freelance")}>Freelance Task</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedCategory("hackathon")}>Hackathon</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedCategory("research")}>Research</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedCategory("other")}>Other</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all hover:scale-105">
            <Filter className="h-4 w-4 mr-2" />
            Industry
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
          <DropdownMenuItem onClick={() => setSelectedIndustry(null)}>All Industries</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedIndustry("technology")}>Technology</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedIndustry("healthcare")}>Healthcare</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedIndustry("finance")}>Finance</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedIndustry("education")}>Education</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all hover:scale-105">
            <Filter className="h-4 w-4 mr-2" />
            Location
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
          <DropdownMenuItem onClick={() => setSelectedLocation(null)}>All Locations</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedLocation("Mumbai")}>Mumbai</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedLocation("Delhi")}>Delhi</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedLocation("Bangalore")}>Bangalore</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedLocation("Remote")}>Remote</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all hover:scale-105">
            <Filter className="h-4 w-4 mr-2" />
            Skills Needed
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
          <DropdownMenuItem onClick={() => setSelectedSkill(null)}>All Skills</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedSkill("development")}>Development</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedSkill("design")}>Design</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedSkill("marketing")}>Marketing</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedSkill("business")}>Business</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
