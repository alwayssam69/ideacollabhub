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
      transition={{ delay: delay / 1000, duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

// Feature card component
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
      whileHover={{ scale: 1.02 }}
      className="flex gap-4 p-6 rounded-2xl bg-card/5 border border-border/50 hover:border-primary/20 transition-colors"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
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
    <div className="min-h-screen bg-background">
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
      
      {/* Sticky navigation (enhanced with motion) */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
        style={{ opacity: headerOpacity }}
      >
        <nav className="container flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            IdeaCollabHub
          </Link>
          <Button asChild variant="default" size="sm">
            <Link to="/auth/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </motion.header>
      
      {/* Hero Section (enhanced with modern design) */}
      <section className="relative pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/80" />
        
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection delay={100}>
              <div className="space-y-8">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                  Where Ideas Meet{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                    Collaboration
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with talented co-founders, developers, and creators. Build your next big project with the perfect team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    asChild 
                    size="lg"
                    className="text-base"
                  >
                    <Link to="/auth/signup">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="text-base"
                  >
                    <Link to="/discover">
                      Explore Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={300}>
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 border border-border/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Central hub visualization */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Network className="h-16 w-16 text-primary" />
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
                        className="absolute w-20 h-20 rounded-full bg-card/70 border border-primary/20 flex items-center justify-center"
                        style={{ top: node.top, left: node.left }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.2, type: "spring" }}
                      >
                        <node.icon className="h-8 w-8 text-primary/80" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-muted/10">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose IdeaCollabHub
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our platform provides everything you need to find the perfect team and bring your ideas to life.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6">
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
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
                  className="p-6 rounded-2xl bg-card/5 border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-12 border border-primary/10">
                <h2 className="text-4xl font-bold mb-6">
                  Ready to Find Your Perfect Team?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join our community of builders, creators, and innovators today.
                </p>
                <Button 
                  asChild 
                  size="lg"
                  className="text-lg"
                >
                  <Link to="/auth/signup">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
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

