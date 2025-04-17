
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <p className="mb-4">
            We respect your privacy. All user data including profiles, messages, and preferences are securely stored and never shared with third-party services. We use Supabase for secure backend operations and analytics only to improve your experience.
          </p>
          <p className="mb-4">
            Our platform collects only the information necessary to provide you with a personalized experience and to help you connect with other professionals.
          </p>
          <p>
            If you have any questions or concerns about your privacy, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
