
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Users, Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Stars, Cloud } from "@react-three/drei";

function Background() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
        <Cloud 
          opacity={0.5} 
          speed={0.4} 
          depth={1.5} 
          segments={20} 
        />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}

export default function Index() {
  return (
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)]">
      <Background />
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-background/90 to-background/50 backdrop-blur-sm">
        <div className="container max-w-4xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Connect, Collaborate, and{" "}
            <span className="text-primary">Create Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Match with like-minded founders, freelancers, students, and professionals
            to turn your ideas into reality with IdeaCollabHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-base relative overflow-hidden group transition-all duration-300 ease-out hover:scale-105"
            >
              <Link to="/auth/signup">
                Get Started
                <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-base group hover:bg-secondary/10 transition-all duration-300"
            >
              <Link to="/discover">
                Explore Projects
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 container relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to find the perfect match for your next big idea
            or project. Here's how:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Find Your Match",
              description: "Discover potential collaborators based on skills, experience, and shared interests."
            },
            {
              icon: Zap,
              title: "Connect Instantly",
              description: "Start real-time conversations with your matches and discuss your ideas."
            },
            {
              icon: Briefcase,
              title: "Launch Projects",
              description: "Post your ideas, find team members, and bring your vision to life."
            }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-card/50 backdrop-blur-md rounded-lg p-6 hover:bg-card/80 transition-all duration-500 ease-out hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-10">
        <div className="container text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md rounded-2xl p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Ready to turn your ideas into reality?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of founders, freelancers, and professionals building the next big thing.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="text-base group hover:scale-105 transition-all duration-300"
            >
              <Link to="/auth/signup">
                Join Now 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
