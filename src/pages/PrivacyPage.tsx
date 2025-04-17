
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 animate-fade-in">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          How we protect your data and respect your privacy
        </p>
      </div>
      
      <Card className="border border-border/50 shadow-md hover:shadow-lg transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="text-lg space-y-6">
          <p className="mb-4 leading-relaxed">
            We respect your privacy. All user data including profiles, messages, and preferences are securely stored and never shared with third-party services. We use Supabase for secure backend operations and analytics only to improve your experience.
          </p>
          
          <p className="mb-4 leading-relaxed">
            Our platform collects only the information necessary to provide you with a personalized experience and to help you connect with other professionals.
          </p>
          
          <h3 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Profile information you provide (name, skills, interests, location)</li>
            <li>Communication data between users</li>
            <li>Usage information to improve our platform</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-8 mb-4">How We Use Your Data</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and maintain your profile</li>
            <li>To facilitate connections between users</li>
            <li>To provide personalized recommendations</li>
            <li>To improve our platform and services</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-8 mb-4">Your Rights</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Restrict or object to processing</li>
          </ul>
          
          <div className="bg-muted/30 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
            <p className="text-base">
              If you have any questions or concerns about your privacy, please contact our support team at <span className="text-primary">support@ourplatform.com</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
