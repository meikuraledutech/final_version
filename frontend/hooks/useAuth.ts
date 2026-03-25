'use client';

import { useEffect, useState } from 'react';
import { authStore } from '@/store/authStore';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, accessToken, refreshToken, claims } = authStore();

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { accessToken, refreshToken, claims } = JSON.parse(stored);
        authStore.setState({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          claims,
        });
      } catch (error) {
        console.error('Failed to restore auth from localStorage:', error);
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    accessToken,
    refreshToken,
    claims,

    // Permission checks
    hasPermission: (permission: string) =>
      claims?.permissions?.includes(permission) ?? false,

    // Group checks
    isInGroup: (group: string) => claims?.groups?.includes(group) ?? false,

    // Common checks
    isAdmin: () =>
      claims?.permissions?.includes('users:manage') ?? false,

    isUser: () => claims?.groups?.includes('user') ?? false,

    // User info
    userId: claims?.user_id,
    email: claims?.email,
  };
}
