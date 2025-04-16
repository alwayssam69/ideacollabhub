
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data for profiles
const mockProfiles = [
  {
    id: 1,
    name: "Alex Johnson",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    bio: "Passionate about creating innovative web applications. Looking to join a startup team.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    experience: "5+ years",
    lookingFor: "Co-founder, Project Collaboration",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: 2,
    name: "Sarah Lee",
    title: "UI/UX Designer",
    location: "New York, NY",
    bio: "Creative designer with a passion for user-centric experiences. Looking for tech collaborators.",
    skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
    experience: "3+ years",
    lookingFor: "Freelance Work, Project Collaboration",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: 3,
    name: "Michael Chen",
    title: "Product Manager",
    location: "Austin, TX",
    bio: "Experienced in bringing products from concept to market. Looking for innovative teams to join.",
    skills: ["Product Strategy", "Market Research", "Agile", "Growth"],
    experience: "7+ years",
    lookingFor: "Co-founder, Advisor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

export default function DiscoverPage() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);

  const currentProfile = mockProfiles[currentProfileIndex];

  const handleNextProfile = () => {
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast.info("You've seen all profiles!");
    }
  };

  const handlePreviousProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    }
  };

  const handleLike = () => {
    setLikedProfiles([...likedProfiles, currentProfile.id]);
    toast.success("Match request sent!");
    handleNextProfile();
  };

  const handlePass = () => {
    handleNextProfile();
  };

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discover Collaborators</h1>
        
        <div className="flex justify-center mb-8">
          {currentProfile && (
            <div className="w-full">
              <Card className="border-2 shadow-lg">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <img
                      src={currentProfile.image}
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl">{currentProfile.name}</CardTitle>
                  <CardDescription className="text-lg font-medium">
                    {currentProfile.title}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    {currentProfile.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-muted-foreground">{currentProfile.bio}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Experience</h3>
                    <p className="text-sm">{currentProfile.experience}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Looking for</h3>
                    <p className="text-sm">{currentProfile.lookingFor}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-14 w-14"
                    onClick={handlePass}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full bg-green-500 hover:bg-green-600 h-14 w-14"
                    onClick={handleLike}
                  >
                    <Check className="h-6 w-6" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="flex justify-between mt-4">
                <Button
                  variant="ghost"
                  onClick={handlePreviousProfile}
                  disabled={currentProfileIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {currentProfileIndex + 1} of {mockProfiles.length}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleNextProfile}
                  disabled={currentProfileIndex === mockProfiles.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
