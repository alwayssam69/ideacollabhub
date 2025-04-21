
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
// Add new providers
import { MessagingProvider } from "@/context/MessagingContext";
import { ConnectionProvider } from "@/context/ConnectionContext";

export function MainLayout() {
  return (
    <ConnectionProvider>
      <MessagingProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
          <Header />
          <div className="flex-1 flex container">
            <SideNav className="hidden md:block w-48 shrink-0 -ml-4" />
            <main className="flex-1 py-6">
              <Outlet />
            </main>
          </div>
          <Footer />
          <Toaster richColors closeButton position="top-center" />
        </div>
      </MessagingProvider>
    </ConnectionProvider>
  );
}
