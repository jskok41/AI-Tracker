'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/lib/auth-actions';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await requestPasswordReset(data);

      if (result.success) {
        setEmailSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">AI Tracker</span>
          </div>
          <CardTitle className="text-2xl text-center">
            {emailSent ? 'Check your email' : 'Forgot password?'}
          </CardTitle>
          <CardDescription className="text-center">
            {emailSent
              ? 'If an account exists with this email, you will receive a password reset link shortly.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isPending}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? 'Sending...' : 'Send reset link'}
              </Button>
              <Link
                href="/auth/login"
                className="flex items-center justify-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Back to sign in</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

