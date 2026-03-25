import { create } from 'zustand';
import { decodeToken, type AuthClaims } from '@/lib/auth';

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  claims: AuthClaims | null;

  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshTokens: (accessToken: string, refreshToken: string) => void;
}

export const authStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  claims: null,

  login: (accessToken, refreshToken) => {
    const claims = decodeToken(accessToken);
    set({
      isAuthenticated: true,
      accessToken,
      refreshToken,
      claims,
    });
    localStorage.setItem(
      'auth',
      JSON.stringify({ accessToken, refreshToken, claims })
    );
  },

  logout: () => {
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      claims: null,
    });
    localStorage.removeItem('auth');
  },

  refreshTokens: (accessToken, refreshToken) => {
    const claims = decodeToken(accessToken);
    set({ accessToken, refreshToken, claims });
    localStorage.setItem(
      'auth',
      JSON.stringify({ accessToken, refreshToken, claims })
    );
  },
}));
