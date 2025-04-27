
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { type Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  title: z.string().min(2, {
    message: "Professional title is required.",
  }),
  location: z.string(),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }),
  stage: z.string(),
  industry: z.string(),
  availability: z.string(),
  meeting_preference: z.string(),
  project_stage: z.string(),
  project_description: z.string(),
  motivation: z.string(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Profile = Tables<"profiles">;

export default function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newProjectType, setNewProjectType] = useState("");
  const [formData, setFormData] = useState<Partial<Profile>>({});

  // Redirect to auth page if user is not authenticated
  useEffect(() => {
    if (!user && !loading) {
      toast.error("Please log in to view your profile");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      title: profile?.title || "",
      location: profile?.location || "",
      bio: profile?.bio || "",
      stage: profile?.stage || "",
      industry: profile?.industry || "",
      availability: profile?.availability || "",
      meeting_preference: profile?.meeting_preference || "",
      project_stage: profile?.project_stage || "",
      project_description: profile?.project_description || "",
      motivation: profile?.motivation || "",
      linkedin_url: profile?.linkedin_url || "",
      portfolio_url: profile?.portfolio_url || "",
    },
  });

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        title: profile.title || "",
        location: profile.location || "",
        bio: profile.bio || "",
        stage: profile.stage || "",
        industry: profile.industry || "",
        availability: profile.availability || "",
        meeting_preference: profile.meeting_preference || "",
        project_stage: profile.project_stage || "",
        project_description: profile.project_description || "",
        motivation: profile.motivation || "",
        linkedin_url: profile.linkedin_url || "",
        portfolio_url: profile.portfolio_url || "",
      });
    }
  }, [profile, form]);

  // Fetch profile data when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setFormData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [user]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile({
        ...data,
        skills: profile?.skills || [],
        looking_for: profile?.looking_for || [],
        preferred_industries: profile?.preferred_industries || [],
        preferred_project_types: profile?.preferred_project_types || [],
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  }

  const addSkill = () => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    if (newSkill && !profile?.skills?.includes(newSkill)) {
      updateProfile({
        skills: [...(profile?.skills || []), newSkill],
      });
      setNewSkill("");
      toast.success("Skill added");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    updateProfile({
      skills: profile?.skills?.filter(skill => skill !== skillToRemove) || [],
    });
    toast.success("Skill removed");
  };

  const addIndustry = () => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    if (newIndustry && !profile?.preferred_industries?.includes(newIndustry)) {
      updateProfile({
        preferred_industries: [...(profile?.preferred_industries || []), newIndustry],
      });
      setNewIndustry("");
      toast.success("Industry preference added");
    }
  };

  const removeIndustry = (industryToRemove: string) => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    updateProfile({
      preferred_industries: profile?.preferred_industries?.filter(industry => industry !== industryToRemove) || [],
    });
    toast.success("Industry preference removed");
  };

  const addProjectType = () => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    if (newProjectType && !profile?.preferred_project_types?.includes(newProjectType)) {
      updateProfile({
        preferred_project_types: [...(profile?.preferred_project_types || []), newProjectType],
      });
      setNewProjectType("");
      toast.success("Project type preference added");
    }
  };

  const removeProjectType = (typeToRemove: string) => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    
    updateProfile({
      preferred_project_types: profile?.preferred_project_types?.filter(type => type !== typeToRemove) || [],
    });
    toast.success("Project type preference removed");
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;

      setFormData(formData as Profile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where user is null
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Please log in to view your profile</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.full_name}</CardTitle>
                  <CardDescription>{profile?.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile?.bio && (
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {profile?.project_description && (
                <div>
                  <h3 className="font-medium mb-2">Project</h3>
                  <p className="text-muted-foreground">{profile.project_description}</p>
                  {profile.project_stage && (
                    <Badge className="mt-2">{profile.project_stage}</Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.looking_for && profile.looking_for.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Looking For</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.looking_for.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile?.motivation && (
                <div>
                  <h3 className="font-medium mb-2">Motivation</h3>
                  <p className="text-muted-foreground">{profile.motivation}</p>
                </div>
              )}

              <div className="flex space-x-4">
                {profile?.linkedin_url && (
                  <Button variant="outline" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile?.portfolio_url && (
                  <Button variant="outline" asChild>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <ProfilePhotoUpload
                      userId={user.id}
                      currentPhotoUrl={profile?.avatar_url}
                      onPhotoUpdate={(url) => {
                        setFormData((prev) => ({ ...prev, avatar_url: url }));
                      }}
                      size="lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Idea">Idea</SelectItem>
                              <SelectItem value="MVP">MVP</SelectItem>
                              <SelectItem value="Live">Live</SelectItem>
                              <SelectItem value="Scaling">Scaling</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile?.skills?.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add new skill"
                        />
                        <Button type="button" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Preferred Industries</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile?.preferred_industries?.map((industry) => (
                          <Badge key={industry} variant="secondary">
                            {industry}
                            <button
                              type="button"
                              onClick={() => removeIndustry(industry)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newIndustry}
                          onChange={(e) => setNewIndustry(e.target.value)}
                          placeholder="Add new industry"
                        />
                        <Button type="button" onClick={addIndustry}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Preferred Project Types</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile?.preferred_project_types?.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                            <button
                              type="button"
                              onClick={() => removeProjectType(type)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newProjectType}
                          onChange={(e) => setNewProjectType(e.target.value)}
                          placeholder="Add new project type"
                        />
                        <Button type="button" onClick={addProjectType}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="project_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivation</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portfolio_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
