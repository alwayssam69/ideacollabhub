
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MessageCircle, User, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

// Mock data for connections
const mockConnections = [
  {
    id: 1,
    name: "Alex Johnson",
    title: "Full Stack Developer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    skills: ["React", "Node.js", "TypeScript"],
    location: "San Francisco, CA",
    connectionDate: "2 days ago",
    status: "connected",
  },
  {
    id: 2,
    name: "Sarah Lee",
    title: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    skills: ["Figma", "Adobe XD", "UI Design"],
    location: "New York, NY",
    connectionDate: "1 week ago",
    status: "connected",
  },
];

// Mock data for pending requests
const mockPendingRequests = [
  {
    id: 3,
    name: "Michael Chen",
    title: "Product Manager",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    skills: ["Product Strategy", "Market Research", "Agile"],
    location: "Austin, TX",
    requestDate: "3 days ago",
    status: "pending",
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    title: "Marketing Specialist",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    skills: ["Social Media", "Content Marketing", "SEO"],
    location: "Chicago, IL",
    requestDate: "5 days ago",
    status: "pending",
  },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(mockConnections);
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);

  const handleAcceptRequest = (requestId: number) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      setConnections([...connections, { ...request, status: "connected", connectionDate: "Just now" }]);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      toast.success(`Connection request from ${request.name} accepted!`);
    }
  };

  const handleRejectRequest = (requestId: number) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      toast.info(`Connection request from ${request.name} declined.`);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Network</h1>

      <Tabs defaultValue="connections" className="mb-8">
        <TabsList>
          <TabsTrigger value="connections">
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={connection.image}
                        alt={connection.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <CardDescription>{connection.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {connection.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium mb-1">Location:</div>
                      <div className="text-sm">{connection.location}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium mb-1">Connected:</div>
                      <div className="text-sm">{connection.connectionDate}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button size="sm" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {connections.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">You don't have any connections yet.</p>
                <Button asChild>
                  <a href="/discover">Find Collaborators</a>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={request.image}
                        alt={request.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.name}</CardTitle>
                      <CardDescription>{request.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {request.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium mb-1">Location:</div>
                      <div className="text-sm">{request.location}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium mb-1">Request Date:</div>
                      <div className="text-sm">{request.requestDate}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {pendingRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">You don't have any pending connection requests.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
