
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AuthMode = "signin" | "signup";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthForm({ mode = "signin" }: { mode?: AuthMode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(mode);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: FormValues) {
    setIsLoading(true);
    
    // This is a mock authentication - in a real app, you would connect to Supabase
    setTimeout(() => {
      setIsLoading(false);
      
      if (authMode === "signin") {
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
      } else {
        toast.success("Welcome to IdeaCollabHub!", {
          description: "Your account has been created successfully.",
        });
      }
      
      console.log(values);
    }, 1500);
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    form.reset();
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {authMode === "signin" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground">
          {authMode === "signin"
            ? "Enter your credentials to sign in to your account"
            : "Enter your information to create an account"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {authMode === "signin" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>{authMode === "signin" ? "Sign in" : "Create account"}</>
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <Button variant="link" onClick={toggleAuthMode}>
          {authMode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
}
