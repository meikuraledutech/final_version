'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AuthGuard({
  children,
  requiredPermission,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasPermission, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Check if authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check if has required permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, requiredPermission, pathname, router, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  if (requiredPermission && !hasPermission(requiredPermission)) return null;

  return <>{children}</>;
}
