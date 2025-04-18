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
  Search,
  Sparkles
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
                  "w-full justify-center p-2 h-10 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "hover:bg-muted/50"
                )}
                size="icon"
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-background/95 backdrop-blur-sm">
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
          "w-full justify-start gap-3 pl-3 rounded-lg transition-all duration-200",
          isActive 
            ? "bg-primary/10 text-primary hover:bg-primary/20" 
            : "hover:bg-muted/50"
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
      "h-full flex flex-col transition-all duration-300 bg-background/95 backdrop-blur-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 border-b border-border/50 flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link to="/profile" className="flex items-center gap-3 group">
            <Avatar className="ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium group-hover:text-primary transition-colors">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                View Profile
              </p>
            </div>
          </Link>
        )}
        
        {collapsed && (
          <Avatar className="ring-2 ring-primary/20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full hover:bg-muted/50 transition-all duration-200",
            collapsed && "ml-0"
          )}
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
      
      <div className="mt-auto p-3 border-t border-border/50">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-full rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-background/95 backdrop-blur-sm">
                Sign out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
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
