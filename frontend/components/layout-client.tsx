'use client';

import { useEffect } from 'react';
import { authStore } from '@/store/authStore';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // On app mount, restore auth from localStorage
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
        // localStorage corrupted → clear it
        console.error('Failed to restore auth from localStorage:', error);
        localStorage.removeItem('auth');
        authStore.getState().logout();
      }
    }
  }, []);

  return <>{children}</>;
}
