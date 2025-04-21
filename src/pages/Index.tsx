import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { 
  Button, 
  Card, 
  CardContent,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Target,
  Star,
  Quote,
  Mail,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useInView } from "react-intersection-observer";

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
  delay = 0,
  className
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className={className}
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

// Testimonial card component
function TestimonialCard({ 
  quote, 
  author, 
  role,
  delay = 0 
}: { 
  quote: string;
  author: string;
  role: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="flex flex-col h-full p-6 rounded-xl bg-gradient-to-b from-card/50 to-card/30 border border-border/50 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow"
    >
      <div className="mb-4">
        <Quote className="h-6 w-6 text-primary/40" />
      </div>
      <p className="flex-grow text-sm leading-relaxed text-muted-foreground mb-6">
        {quote}
      </p>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold">{author}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </motion.div>
  );
}

// 3D Model Component
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Particle Background Component
function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

// Video Background Component
function VideoBackground({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/20" />
    </div>
  );
}

const features = [
  {
    icon: Target,
    title: "Smart Matching",
    description: "Our algorithm connects you with collaborators who complement your skills and share your vision."
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    description: "Communicate seamlessly with potential teammates through our built-in messaging system."
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Connect with confidence knowing all users are verified professionals and students."
  },
  {
    icon: Share2,
    title: "Project Showcase",
    description: "Share your projects and find opportunities to collaborate with other builders."
  },
  {
    icon: Network,
    title: "Global Network",
    description: "Connect with talented individuals from around the world to build your next big idea."
  },
  {
    icon: Rocket,
    title: "Fast Growth",
    description: "Accelerate your project's development with our powerful collaboration tools."
  }
];

export default function Index() {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.98]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const testimonials = [
    {
      quote: "IdeaCollabHub transformed how we build products. The quality of connections and collaboration is unmatched.",
      author: "Sarah Chen",
      role: "Product Lead at TechCorp",
      video: "/testimonial1.mp4"
    },
    // ... more testimonials
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      
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
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/about">About</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/contact">Contact</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="h-8 px-3 text-sm">
                <Link to="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </nav>
        </Container>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <AnimatedSection delay={100}>
                <div className="space-y-6">
                  <motion.h1 
                    className="text-5xl font-bold tracking-tight lg:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Where Ideas Meet{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                      Collaboration
                    </span>
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Connect with talented co-founders, developers, and creators. Build your next big project with the perfect team.
                  </motion.p>
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button 
                      asChild 
                      size="default"
                      className="h-12 px-6 text-base"
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
                      className="h-12 px-6 text-base"
                    >
                      <Link to="/discover">
                        Explore Projects
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </AnimatedSection>
            </div>
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Model url="/3d-model.glb" />
                  <OrbitControls enableZoom={false} />
                </Canvas>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Premium Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to build your next big idea
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <VideoBackground src={testimonials[activeTestimonial].video} />
        <Container>
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto text-center"
              >
                <TestimonialCard {...testimonials[activeTestimonial]} />
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest updates and features
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 text-base"
              />
              <Button size="default" className="h-12 px-6 text-base">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

