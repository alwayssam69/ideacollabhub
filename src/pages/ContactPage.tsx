
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <p className="mb-6">
            Have a question or want to suggest something?<br />
            Reach us at: <a href="mailto:support@ideacollabhub.com" className="text-primary">support@ideacollabhub.com</a><br />
            Or connect on X (Twitter): <a href="https://twitter.com/IdeaCollabHub" className="text-primary">@IdeaCollabHub</a>
          </p>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-semibold">Send us a message</h3>
            <div className="space-y-2">
              <label htmlFor="name">Name</label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message">Message</label>
              <Textarea id="message" placeholder="Your message" className="min-h-[150px]" />
            </div>
            <Button className="w-full">Send Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
