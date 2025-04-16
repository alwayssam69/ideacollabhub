
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import Footer from "./Footer";
import SideNav from "./SideNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function MainLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className={`flex flex-1 ${!isHomePage && "bg-muted/10"}`}>
        {user && !isHomePage && (
          <>
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={toggleSidebar}
              >
                <Menu />
              </Button>
            </div>
            
            {/* Mobile sidebar */}
            <div 
              className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-background shadow-lg transition-transform duration-200 ease-in-out md:hidden ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <SideNav />
            </div>
            
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-30 bg-black/20 md:hidden"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}
            
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <SideNav />
            </div>
          </>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
