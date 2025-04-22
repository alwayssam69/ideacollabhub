
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const { mode = "signin" } = useParams<{ mode?: "signin" | "signup" }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Create initial profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                onboarding_completed: false,
              },
            ]);

          if (profileError) throw profileError;
        }

        toast.success('Account created successfully!');
        navigate('/onboarding');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user needs onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .single();

        if (!profile?.onboarding_completed) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signin'
            ? 'Enter your credentials to sign in'
            : 'Enter your details to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(mode === 'signin' ? '/auth/signup' : '/auth/signin')}
            className="text-sm font-medium text-primary hover:underline"
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : mode === 'signin' ? (
            'Sign in'
          ) : (
            'Sign up'
          )}
        </Button>
      </form>
    </div>
  );
}
