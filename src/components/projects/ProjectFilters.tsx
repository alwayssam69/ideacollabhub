
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ProjectFilters({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange 
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
