import { useState, useEffect } from "react";
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
  Zap,
  Shield,
  Network,
  Target
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Container component for consistent max-width and padding
function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

// Background component with animated stars
function Background() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}

// Animated section component
function AnimatedSection({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Feature card component with improved depth and alignment
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="group relative flex gap-4 rounded-lg border border-border/50 bg-gradient-to-b from-card/50 to-card/30 p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/5"
    >
      <div className="relative h-10 w-10 shrink-0 rounded-lg bg-primary/10 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-7">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
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
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.98]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
          <div className="h-[600px] w-[1200px] rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-20" />
        </div>
      </div>
      
      {/* Navigation */}
      <motion.header 
        className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg"
        style={{ opacity: headerOpacity }}
      >
        <Container>
          <nav className="flex h-14 items-center justify-between">
            <Link to="/" className="text-lg font-semibold">
              IdeaCollabHub
            </Link>
            <Button asChild variant="default" size="sm" className="h-8 px-3 text-sm">
              <Link to="/auth/signup">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </nav>
        </Container>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <AnimatedSection delay={100}>
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    Where Ideas Meet{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                      Collaboration
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Connect with talented co-founders, developers, and creators. Build your next big project with the perfect team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      asChild 
                      size="default"
                      className="h-10 px-4 text-sm"
                    >
                      <Link to="/auth/signup">
                        Start Your Journey
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="default" 
                      variant="outline"
                      className="h-10 px-4 text-sm"
                    >
                      <Link to="/discover">
                        Explore Projects
                      </Link>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-5">
              <AnimatedSection delay={300}>
                <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-border/50 shadow-lg shadow-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Central hub */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Network className="h-12 w-12 text-primary" />
                      </div>
                      
                      {/* Connecting nodes */}
                      {[
                        { top: '10%', left: '20%', icon: Code },
                        { top: '80%', left: '30%', icon: Users },
                        { top: '20%', left: '80%', icon: Rocket },
                        { top: '70%', left: '75%', icon: MessageCircle }
                      ].map((node, index) => (
                        <motion.div
                          key={index}
                          className="absolute w-16 h-16 rounded-full bg-card/70 border border-primary/20 flex items-center justify-center"
                          style={{ top: node.top, left: node.left }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.2, type: "spring" }}
                        >
                          <node.icon className="h-6 w-6 text-primary/80" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <Container className="relative">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-3">
                Why Choose IdeaCollabHub
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                Our platform provides everything you need to find the perfect team and bring your ideas to life.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              icon={Target}
              title="Smart Matching"
              description="Our algorithm connects you with collaborators who complement your skills and share your vision."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Real-Time Chat"
              description="Communicate seamlessly with potential teammates through our built-in messaging system."
            />
            <FeatureCard
              icon={Shield}
              title="Verified Profiles"
              description="Connect with confidence knowing all users are verified professionals and students."
            />
            <FeatureCard
              icon={Share2}
              title="Project Showcase"
              description="Share your projects and find opportunities to collaborate with other builders."
            />
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <Container className="relative">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Create Your Profile",
                  description: "Set up your profile with your skills, interests, and what you're looking to build."
                },
                {
                  icon: Search,
                  title: "Find Your Match",
                  description: "Browse projects and connect with potential collaborators based on mutual interests."
                },
                {
                  icon: Rocket,
                  title: "Start Building",
                  description: "Form your team and begin working on exciting projects together."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative p-5 rounded-lg border border-border/50 bg-gradient-to-b from-card/50 to-card/30 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <AnimatedSection>
              <div className="relative rounded-xl bg-gradient-to-b from-primary/5 to-transparent p-8 shadow-lg shadow-primary/5 border border-primary/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-20 blur-2xl" />
                <div className="relative">
                  <h2 className="text-2xl font-bold mb-4">
                    Ready to Find Your Perfect Team?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Join our community of builders, creators, and innovators today.
                  </p>
                  <Button 
                    asChild 
                    size="default"
                    className="h-10 px-4 text-sm"
                  >
                    <Link to="/auth/signup">
                      Get Started Now
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>
    </div>
  );
}

