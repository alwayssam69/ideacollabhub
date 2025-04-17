
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About Us</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <p className="mb-4">
            We're building a professional networking platform for founders, students, learners, and early hustlers who want to build, connect, and collaborate on real ideas. Whether you're a college dropout, in your 12th drop year, or a curious beginner – this platform helps you connect with mentors, find teammates, and start projects that matter.
          </p>
          <p>
            Our mission is to create opportunities for everyone, regardless of their background or current educational status, to build meaningful professional connections and work on projects that can make a difference.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
