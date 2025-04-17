
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Who is this platform for?</AccordionTrigger>
              <AccordionContent>
                Founders, students, mentors, 12th pass/dropouts, or anyone looking to network.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it free to use?</AccordionTrigger>
              <AccordionContent>
                Yes. All basic features like matching and messaging are free.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I find the right people?</AccordionTrigger>
              <AccordionContent>
                Use filters in "Find Connection" to discover people by skill, purpose, or location.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How does the onboarding process work?</AccordionTrigger>
              <AccordionContent>
                After signing up, you'll complete a multi-step form to provide details about yourself, your skills, and what you're looking for. This helps us connect you with the right people.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I change my profile information later?</AccordionTrigger>
              <AccordionContent>
                Yes, you can update your profile information at any time through the Settings page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
