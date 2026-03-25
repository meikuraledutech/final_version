export interface AuthClaims {
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
  groups: string[];
}

export function decodeToken(token: string): AuthClaims | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role || "students",
      permissions: decoded.permissions || [],
      groups: decoded.groups || [],
    };
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
}
