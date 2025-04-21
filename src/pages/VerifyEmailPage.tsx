import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'unverified'>('checking');

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser?.email_confirmed_at) {
          setVerificationStatus('verified');
          // Check onboarding status
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (!profile?.onboarding_completed) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        } else {
          setVerificationStatus('unverified');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        toast.error('Failed to check verification status');
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkVerificationStatus();

    // Set up polling
    const interval = setInterval(checkVerificationStatus, 5000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email,
      });

      if (error) throw error;

      toast.success('Verification email sent!');
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to {user?.email}
          </p>
        </div>

        {verificationStatus === 'unverified' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please check your email and click the verification link to continue.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
            >
              Resend verification email
            </Button>
          </div>
        )}

        {verificationStatus === 'checking' && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Checking verification status...
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 