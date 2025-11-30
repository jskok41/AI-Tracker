'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold">Something went wrong!</h1>
        <p className="text-muted-foreground">
          {error.message || 'An error occurred while processing your request.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/auth/register'}>
            Go to Register
          </Button>
        </div>
        <details className="mt-4 text-left max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details (for debugging)
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack || error.toString()}
          </pre>
        </details>
      </div>
    </div>
  );
}
