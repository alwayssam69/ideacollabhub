
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
  Search,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
};

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 pl-2", 
          isActive && "bg-muted font-medium"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

export default function SideNav() {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    const { success, error } = await signOut();
    
    if (success) {
      toast.success("Signed out successfully");
    } else {
      toast.error("Sign out failed", {
        description: error
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <Link to="/profile" className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">View Profile</p>
          </div>
        </Link>
      </div>
      
      <div className="flex flex-col gap-1 p-2">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/discover" icon={Search} label="Find Matches" />
        <NavItem to="/messages" icon={MessageSquare} label="Messages" />
        <NavItem to="/connections" icon={Users} label="Connections" />
        <NavItem to="/explore-posts" icon={FileText} label="Explore Posts" />
        <NavItem to="/projects" icon={Briefcase} label="Projects" />
        <NavItem to="/profile" icon={User} label="Profile" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
      
      <div className="mt-auto p-3 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
