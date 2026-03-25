'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PublicGuardProps {
  children: React.ReactNode;
}

export function PublicGuard({ children }: PublicGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // If already authenticated, redirect to home
    if (isAuthenticated) {
      router.push('/home');
      return;
    }
  }, [isAuthenticated, router, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
