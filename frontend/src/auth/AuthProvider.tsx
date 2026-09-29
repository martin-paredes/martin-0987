import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { AUTH_KEYS } from '../services/authStorage';
import { AuthContext } from './AuthContext';
import type { User } from './schemas';

function restoreUser(): User | null {
  try {
    return authService.restore();
  } catch {
    // Fallar sin sesión; los formularios muestran el error si el almacenamiento está bloqueado.
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(restoreUser);

  useEffect(() => {
    function syncStorage(event: StorageEvent) {
      if (event.key === null || event.key === AUTH_KEYS.user || event.key === AUTH_KEYS.session) {
        setUser(restoreUser());
      }
    }
    window.addEventListener('storage', syncStorage);
    return () => window.removeEventListener('storage', syncStorage);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      register: authService.register,
      async login(input) {
        const authenticatedUser = await authService.login(input);
        setUser(authenticatedUser);
      },
      logout() {
        authService.logout();
        setUser(null);
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}
