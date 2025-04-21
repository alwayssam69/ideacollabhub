
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyPostsState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";
import { Project, Profile } from "@/hooks/useProjects";

interface ProjectListProps {
  loading: boolean;
  projects: Project[];
  creators: Record<string, Profile>;
}

export function ProjectList({ loading, projects, creators }: ProjectListProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (projects.length === 0) {
    return <EmptyPostsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const creator = creators[project.user_id];
        return (
          <ProjectCard 
            key={project.id} 
            project={project} 
            creator={creator}
          />
        );
      })}
    </div>
  );
}
