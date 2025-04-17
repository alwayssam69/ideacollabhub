
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserPlus,
  Users,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
};

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={to} className="inline-block w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center p-2 h-10", 
                  isActive && "bg-primary/10 text-primary"
                )}
                size="icon"
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-3", 
          isActive && "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </Button>
    </Link>
  );
};

export default function SideNav() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
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
    <div className={cn(
      "border-r h-full flex flex-col transition-all duration-300 bg-background",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 border-b flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
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
        )}
        
        {collapsed && (
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("rounded-full", collapsed && "ml-0")}
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 p-2">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/discover" icon={Search} label="Find Connections" collapsed={collapsed} />
        <NavItem to="/messages" icon={MessageSquare} label="Messages" collapsed={collapsed} />
        <NavItem to="/pending-requests" icon={UserPlus} label="Pending Requests" collapsed={collapsed} />
        <NavItem to="/connections" icon={Users} label="Connections" collapsed={collapsed} />
        <NavItem to="/notifications" icon={Bell} label="Notifications" collapsed={collapsed} />
        <NavItem to="/profile" icon={User} label="Profile" collapsed={collapsed} />
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
      </div>
      
      <div className="mt-auto p-3 border-t">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Sign out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </Button>
        )}
      </div>
    </div>
  );
}
