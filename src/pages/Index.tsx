import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { 
  Button, 
  Card, 
  CardContent,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui";
import { 
  ArrowRight, 
  Briefcase, 
  Code, 
  Compass, 
  Filter, 
  Lightbulb, 
  MessageCircle, 
  Rocket, 
  Search, 
  Share2, 
  Sparkles, 
  Users, 
  Zap
} from "lucide-react";

// Define props interface for ErrorBoundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
}

// Simple error boundary for WebGL errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Pass the error to parent component
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // The parent will render the fallback
    }
    return this.props.children;
  }
}

// Background component with animated stars and fallback
function Background() {
  const [hasWebGLError, setHasWebGLError] = useState(false);
  
  // Fallback for WebGL errors
  const handleWebGLError = (error: Error) => {
    console.log("WebGL error detected, switching to fallback background", error);
    setHasWebGLError(true);
  };

  // Simple fallback background
  if (hasWebGLError) {
    return (
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-background/80">
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `pulse ${Math.random() * 3 + 2}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />}>
        <ErrorBoundary onError={handleWebGLError}>
          <Canvas 
            camera={{ position: [0, 0, 1] }}
            onCreated={({ gl }) => {
              gl.setClearColor('rgb(15, 23, 42)', 1);
            }}
            gl={{ 
              powerPreference: "default",
              antialias: false,
              stencil: false,
              depth: false,
            }}
          >
            <Stars />
            <ambientLight intensity={0.5} />
          </Canvas>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

// Animated section component
function AnimatedSection({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`transition-all duration-1000 ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <Card className="h-full bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

// Audience card component
function AudienceCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <AnimatedSection delay={delay} className="cursor-pointer">
          <div className="flex flex-col items-center px-4 py-6 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        </AnimatedSection>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-card/80 backdrop-blur-md border-primary/20">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Step card for how it works section
function StepCard({ 
  number, 
  title, 
  description, 
  icon: Icon, 
  delay = 0 
}: { 
  number: number; 
  title: string; 
  description: string; 
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="relative flex flex-col h-full">
        {/* Number indicator */}
        <div className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm z-10">
          {number}
        </div>
        
        {/* Card content */}
        <div className="h-full rounded-xl p-6 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </AnimatedSection>
  );
}

// Feature detail component
function FeatureDetail({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h4 className="text-md font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Animated shape component
function AnimatedShape({ 
  className = "", 
  delay = 0 
}: { 
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`absolute opacity-50 rounded-full ${className} transition-all duration-1000 ease-out ${
        isVisible 
          ? "opacity-50 scale-100" 
          : "opacity-0 scale-0"
      }`}
    ></div>
  );
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)]">
      <Background />
      
      {/* Abstract shapes for visual interest */}
      <AnimatedShape 
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 w-64 h-64 blur-3xl top-20 left-10" 
        delay={200} 
      />
      <AnimatedShape 
        className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 w-80 h-80 blur-3xl bottom-40 right-10" 
        delay={400} 
      />
      <AnimatedShape 
        className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 w-72 h-72 blur-3xl top-96 left-1/2" 
        delay={600} 
      />
      
      {/* Sticky navigation (animated on scroll) */}
      <div 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-md shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="container py-4 flex justify-end">
          <Button 
            asChild 
            variant={scrolled ? "default" : "outline"} 
            size="sm" 
            className="group transition-all duration-300"
          >
            <Link to="/auth/signup">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection delay={100}>
              <div className="space-y-6 max-w-xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-secondary to-purple-500">
                  Connect with co-founders, collaborators, and talent — instantly
                </h1>
                <p className="text-xl text-muted-foreground">
                  A networking platform built for student founders, indie hackers, and builders to find the perfect match for your next project.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-base group relative overflow-hidden"
                  >
                    <Link to="/auth/signup">
                      Start Connecting
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline" 
                    className="text-base border-primary/20 hover:bg-primary/5"
                  >
                    <Link to="/discover">
                      Browse Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={300}>
              <div className="relative h-[400px] w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Abstract collaborative network illustration */}
                  <div className="relative w-full h-full max-w-lg">
                    {/* Center node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center z-10 animate-pulse-subtle">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    
                    {/* Connection nodes */}
                    {[
                      { top: '15%', left: '20%', icon: Code, delay: 200 },
                      { top: '70%', left: '30%', icon: Lightbulb, delay: 400 },
                      { top: '20%', left: '75%', icon: Briefcase, delay: 600 },
                      { top: '75%', left: '70%', icon: MessageCircle, delay: 800 }
                    ].map((node, index) => (
                      <div 
                        key={index}
                        className="absolute w-14 h-14 rounded-full bg-card/70 backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-float"
                        style={{ 
                          top: node.top, 
                          left: node.left, 
                          animationDelay: `${node.delay}ms` 
                        }}
                      >
                        <node.icon className="h-6 w-6 text-primary/80" />
                      </div>
                    ))}
                    
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {[
                        { x1: "50%", y1: "50%", x2: "20%", y2: "15%", delay: 200 },
                        { x1: "50%", y1: "50%", x2: "30%", y2: "70%", delay: 400 },
                        { x1: "50%", y1: "50%", x2: "75%", y2: "20%", delay: 600 },
                        { x1: "50%", y1: "50%", x2: "70%", y2: "75%", delay: 800 }
                      ].map((line, index) => (
                        <line 
                          key={index}
                          x1={line.x1} 
                          y1={line.y1} 
                          x2={line.x2} 
                          y2={line.y2}
                          className={`stroke-primary/30 stroke-2 animate-pulse-subtle`}
                          style={{ 
                            strokeDasharray: "5,5",
                            animationDelay: `${line.delay}ms`
                          }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform makes it easy to find the perfect match for your next big idea
                or project in just three simple steps.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-10 mt-12">
            <StepCard
              number={1}
              title="Create your profile"
              description="Set up your profile with your skills, experience, and what you're looking to build or contribute to."
              icon={Users}
              delay={100}
            />
            <StepCard
              number={2}
              title="Match with people"
              description="Our algorithm connects you with relevant people based on skills, goals, and mutual interests."
              icon={Search}
              delay={300}
            />
            <StepCard
              number={3}
              title="Chat & collaborate"
              description="Message your connections in real-time, discuss ideas, and start building together."
              icon={MessageCircle}
              delay={500}
            />
          </div>
        </div>
      </section>
      
      {/* Why Use This Platform Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Why Use IdeaCollabHub
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers unique features designed specifically for founders, creators, and builders looking to connect.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <FeatureCard
              icon={Sparkles}
              title="Smart Matching"
              description="Our algorithm matches you with people who complement your skills and share your vision."
              delay={100}
            />
            <FeatureCard
              icon={MessageCircle}
              title="Real-Time Chat"
              description="Connect instantly with potential collaborators through our seamless messaging system."
              delay={200}
            />
            <FeatureCard
              icon={Share2}
              title="Project Posting"
              description="Share your ideas and projects to attract the right talent and collaborators."
              delay={300}
            />
            <FeatureCard
              icon={Filter}
              title="Advanced Filters"
              description="Find exactly what you're looking for with filters for skills, roles, and interests."
              delay={400}
            />
          </div>
        </div>
      </section>
      
      {/* Audience Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Built For You
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover how IdeaCollabHub helps different types of builders connect and collaborate.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            <AudienceCard
              icon={Rocket}
              title="Student Founders"
              description="Connect with fellow students to bring your startup ideas to life. Find technical co-founders, designers, and marketers for your venture."
              delay={100}
            />
            <AudienceCard
              icon={Code}
              title="Indie Hackers"
              description="Build your side project faster by finding collaborators with complementary skills. Connect with others who share your entrepreneurial spirit."
              delay={200}
            />
            <AudienceCard
              icon={Briefcase}
              title="Freelancers"
              description="Find project opportunities and partner with other freelancers to take on larger clients and create meaningful work."
              delay={300}
            />
            <AudienceCard
              icon={Lightbulb}
              title="Idea Builders"
              description="Have a great idea but need help executing? Connect with technical talents and domain experts to turn your vision into reality."
              delay={400}
            />
          </div>
        </div>
      </section>
      
      {/* Features Summary Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection delay={100}>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm border border-primary/10">
                <h3 className="text-2xl font-bold mb-8 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Everything You Need
                </h3>
                
                <div className="space-y-6">
                  <FeatureDetail
                    icon={Compass}
                    title="Interactive Dashboard"
                    description="Personalized dashboard with filters to discover the perfect matches."
                  />
                  <FeatureDetail
                    icon={MessageCircle}
                    title="Real-Time Communication"
                    description="Chat with connections instantly to discuss ideas and opportunities."
                  />
                  <FeatureDetail
                    icon={Users}
                    title="Skill-Based Matching"
                    description="Our algorithm matches people based on complementary skills and interests."
                  />
                  <FeatureDetail
                    icon={Zap}
                    title="Quick Project Setup"
                    description="Create and share projects with just a few clicks to attract collaborators."
                  />
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={300}>
              <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Abstract dashboard visualization */}
                  <div className="relative w-full h-full p-4">
                    {/* Dashboard header */}
                    <div className="w-full h-16 rounded-lg bg-card/30 backdrop-blur-sm mb-4 flex items-center px-4">
                      <div className="h-8 w-8 rounded-full bg-primary/20 mr-4"></div>
                      <div className="h-4 w-32 bg-white/20 rounded-md"></div>
                      <div className="ml-auto flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20"></div>
                        <div className="h-8 w-8 rounded-full bg-white/20"></div>
                      </div>
                    </div>
                    
                    {/* Dashboard content */}
                    <div className="grid grid-cols-5 gap-4 h-[calc(100%-4rem)]">
                      {/* Sidebar */}
                      <div className="col-span-1 bg-card/20 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-2">
                        {Array(5).fill(null).map((_, i) => (
                          <div key={i} className="h-10 bg-white/10 rounded-md"></div>
                        ))}
                      </div>
                      
                      {/* Main content */}
                      <div className="col-span-4 flex flex-col gap-4">
                        {/* Search and filters */}
                        <div className="h-12 bg-card/20 backdrop-blur-sm rounded-lg flex items-center px-4 gap-2">
                          <div className="h-6 w-40 bg-white/20 rounded-md"></div>
                          <div className="h-6 w-6 bg-white/20 rounded-md ml-auto"></div>
                          <div className="h-6 w-6 bg-white/20 rounded-md"></div>
                        </div>
                        
                        {/* Content cards */}
                        <div className="grid grid-cols-2 gap-4 flex-grow">
                          {Array(4).fill(null).map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-card/20 backdrop-blur-sm rounded-lg p-4 flex flex-col"
                              style={{
                                animationDelay: `${i * 200}ms`
                              }}
                            >
                              <div className="flex items-center mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary/20 mr-3"></div>
                                <div className="flex flex-col gap-1">
                                  <div className="h-4 w-20 bg-white/20 rounded-sm"></div>
                                  <div className="h-3 w-16 bg-white/10 rounded-sm"></div>
                                </div>
                              </div>
                              <div className="space-y-2 mb-auto">
                                <div className="h-4 w-full bg-white/20 rounded-sm"></div>
                                <div className="h-4 w-3/4 bg-white/20 rounded-sm"></div>
                                <div className="h-4 w-5/6 bg-white/20 rounded-sm"></div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <div className="h-6 w-16 bg-primary/20 rounded-md"></div>
                                <div className="h-6 w-16 bg-white/10 rounded-md"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <AnimatedSection>
              <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md p-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary via-secondary to-purple-500">
                  Ready to turn your ideas into reality?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of founders, freelancers, and professionals building the next big thing.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg font-medium group hover:scale-105 transition-all duration-300"
                >
                  <Link to="/auth/signup">
                    Start Building Together
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
