
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <p className="mb-4">
            By using our platform, you agree to provide accurate profile data, maintain respectful communication, and not misuse the networking or messaging features. We reserve the right to remove or block users violating our community guidelines.
          </p>
          <p className="mb-4">
            All users are expected to act professionally and treat others with respect. Harassment, spam, or any form of inappropriate behavior will not be tolerated.
          </p>
          <p>
            We may update these terms from time to time, and continued use of the platform after such changes constitutes acceptance of the new terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
