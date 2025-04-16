
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Users, Zap } from "lucide-react";

export default function Index() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-accent to-background">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Connect, Collaborate, and{" "}
            <span className="text-primary">Create Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Match with like-minded founders, freelancers, students, and professionals
            to turn your ideas into reality with IdeaCollabHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/discover">Explore Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to find the perfect match for your next big idea
            or project. Here's how:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
            <p className="text-muted-foreground mb-4">
              Discover potential collaborators based on skills, experience, and shared interests.
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Instantly</h3>
            <p className="text-muted-foreground mb-4">
              Start real-time conversations with your matches and discuss your ideas.
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Launch Projects</h3>
            <p className="text-muted-foreground mb-4">
              Post your ideas, find team members, and bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to turn your ideas into reality?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of founders, freelancers, and professionals building the next big thing.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to="/auth/signup">
              Join Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
