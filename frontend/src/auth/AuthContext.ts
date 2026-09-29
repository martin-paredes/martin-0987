import { createContext, useContext } from 'react';
import type { LoginInput, RegisterInput, User } from './schemas';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
