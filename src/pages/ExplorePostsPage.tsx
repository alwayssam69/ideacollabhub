
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import {
  Bookmark,
  ChevronDown,
  Filter,
  Loader2,
  MessageCircle,
  Plus,
  ThumbsUp,
  UserPlus
} from "lucide-react";

// Empty state for no posts
function EmptyPostsState() {
  return (
    <div className="text-center py-16 px-6 bg-muted/20 rounded-lg">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Be the first to share your project or idea with the community.
      </p>
      <Button>Create a Post</Button>
    </div>
  );
}

export default function ExplorePostsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Dummy data as we haven't created the posts table yet
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // We'll replace this with a real fetch when we create the posts table
        // For now, we'll show dummy data after a timeout to simulate loading
        setTimeout(() => {
          setLoading(false);
          // Currently we're setting empty posts to demonstrate empty state
          setPosts([]);
        }, 1000);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore Posts</h1>
          <p className="text-muted-foreground mt-1">
            Discover projects and collaborate with others
          </p>
        </div>
        <Button className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="startup">Startup Ideas</TabsTrigger>
            <TabsTrigger value="freelance">Freelance Tasks</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Category
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("startup")}>Startup Idea</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("freelance")}>Freelance Task</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("hackathon")}>Hackathon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("research")}>Research</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("other")}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Industry
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedIndustry(null)}>All Industries</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("technology")}>Technology</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("healthcare")}>Healthcare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("finance")}>Finance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("education")}>Education</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Location
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedLocation(null)}>All Locations</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Mumbai")}>Mumbai</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Delhi")}>Delhi</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Bangalore")}>Bangalore</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Remote")}>Remote</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Skills Needed
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedSkill(null)}>All Skills</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("development")}>Development</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("design")}>Design</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("marketing")}>Marketing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("business")}>Business</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">{post.type}</Badge>
                        <Button variant="ghost" size="icon">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="bg-muted/50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.creator.avatarUrl} />
                              <AvatarFallback>{post.creator.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{post.creator.name}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={post.creator.avatarUrl} />
                              <AvatarFallback>{post.creator.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{post.creator.name}</h4>
                              <p className="text-sm">{post.creator.title}</p>
                              <div className="flex items-center pt-2">
                                <span className="text-xs text-muted-foreground">
                                  {post.creator.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="ghost" className="flex gap-1 items-center h-auto p-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="text-xs">{post.likes}</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="flex gap-1 items-center h-auto p-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">{post.comments}</span>
                        </Button>
                      </div>
                      <Button size="sm">
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        Connect
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyPostsState />
            )}
          </TabsContent>
          
          <TabsContent value="startup">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="freelance">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="hackathon">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="research">
            <EmptyPostsState />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
