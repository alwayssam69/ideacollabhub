
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 animate-fade-in">
          About Us
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Building meaningful connections for ambitious builders and learners
        </p>
      </div>
      
      <Card className="border border-border/50 shadow-md hover:shadow-lg transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-lg space-y-6">
          <p className="mb-4 leading-relaxed">
            We're building a professional networking platform for founders, students, learners, and early hustlers who want to build, connect, and collaborate on real ideas. Whether you're a college dropout, in your 12th drop year, or a curious beginner – this platform helps you connect with mentors, find teammates, and start projects that matter.
          </p>
          <p className="leading-relaxed">
            Our mission is to create opportunities for everyone, regardless of their background or current educational status, to build meaningful professional connections and work on projects that can make a difference.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-primary/5 p-6 rounded-lg hover:bg-primary/10 transition-all">
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-base">Find like-minded individuals who share your passion and vision for building innovative solutions.</p>
            </div>
            
            <div className="bg-secondary/5 p-6 rounded-lg hover:bg-secondary/10 transition-all">
              <h3 className="text-xl font-semibold mb-3">Collaborate</h3>
              <p className="text-base">Work together on projects that matter, combining diverse skills and perspectives.</p>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-lg hover:bg-primary/10 transition-all">
              <h3 className="text-xl font-semibold mb-3">Create</h3>
              <p className="text-base">Build solutions that solve real problems and make a positive impact on the world.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
