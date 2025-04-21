import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import Footer from "./Footer";
import SideNav from "./SideNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MainLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/5">
      <Header />
      <div className={cn(
        "flex flex-1 transition-all duration-300",
        !isHomePage && "bg-muted/5"
      )}>
        {user && !isHomePage && (
          <>
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-xl bg-background/90 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile sidebar */}
            <div 
              className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 transform bg-background/95 backdrop-blur-sm shadow-2xl transition-all duration-300 ease-in-out md:hidden",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <SideNav />
            </div>
            
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Desktop sidebar */}
            <div className="hidden md:block sticky top-0 h-screen">
              <div className="h-full bg-background/95 backdrop-blur-sm border-r border-border/50">
                <SideNav />
              </div>
            </div>
          </>
        )}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
