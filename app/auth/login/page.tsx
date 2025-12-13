'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn, getSession } from 'next-auth/react';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Invalid email or password');
          return;
        }

        if (result?.ok) {
          // Wait a moment for the session cookie to be set
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Verify session was created
          const session = await getSession();
          if (!session) {
            toast.error('Session not created. Please try again.');
            return;
          }

          toast.success('Signed in successfully!');
          
          // Get callback URL or default to root (dashboard is at root)
          let redirectUrl = '/';
          try {
            const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
            // Validate callbackUrl - must start with / and be a valid path
            if (callbackUrl) {
              const decoded = decodeURIComponent(callbackUrl);
              if (decoded.startsWith('/') && 
                  !decoded.includes('//') && 
                  !decoded.includes('http') &&
                  decoded.length < 200) {
                redirectUrl = decoded;
              }
            }
          } catch (error) {
            console.error('Error parsing callbackUrl:', error);
            // Fall back to root
            redirectUrl = '/';
          }
          
          // Small delay to ensure toast is visible and cookie is set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force a full page reload to ensure middleware sees the cookie
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error('Sign in error:', error);
        toast.error('An error occurred during sign in');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">AI Tracker</span>
          </div>
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

