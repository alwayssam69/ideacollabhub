
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const navigate = useNavigate();

  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            If you don't see the email in your inbox, please check your spam folder.
          </p>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Return to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
