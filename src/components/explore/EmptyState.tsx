
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyPostsState() {
  const navigate = useNavigate();
  
  const handleCreatePost = () => {
    navigate('/projects'); // Navigate to projects page to create a new post
  };

  return (
    <div className="text-center py-16 px-6 bg-muted/20 rounded-lg animate-fade-in">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Be the first to share your project or idea with the community.
      </p>
      <Button onClick={handleCreatePost} className="bg-primary hover:bg-primary/90 transition-colors shadow hover:shadow-md">
        Create a Post
      </Button>
    </div>
  );
}
