import { loginSchema, registerSchema } from '../auth/schemas';
import type { LoginInput, RegisterInput, StoredUser, User } from '../auth/schemas';
import { authStorage } from './authStorage';

// Solo para la simulación local. SHA-256 sin salt ni factor de trabajo no es
// almacenamiento de contraseñas apto para producción (ver README).
async function hashPassword(password: string): Promise<string> {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.randomUUID) {
    throw new Error('Tu navegador necesita Web Crypto. Usa localhost o una conexión HTTPS.');
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function publicUser(user: StoredUser): User {
  return { id: user.id, fullName: user.fullName, email: user.email, balance: user.balance };
}

function ensureNoUser() {
  if (authStorage.readUser()) {
    throw new Error('Ya existe un usuario registrado en este navegador. Inicia sesión con esa cuenta.');
  }
}

export const authService = {
  restore(): User | null {
    const user = authStorage.readUser();
    const session = authStorage.readSession();
    return user && session?.userId === user.id ? publicUser(user) : null;
  },

  async register(input: RegisterInput): Promise<void> {
    const data = registerSchema.parse(input);
    ensureNoUser();
    const passwordHash = await hashPassword(data.password);
    // Revalidar después del trabajo asíncrono evita sobrescribir un registro reciente.
    ensureNoUser();
    authStorage.saveUser({
      id: crypto.randomUUID(),
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      balance: 0,
    });
  },

  async login(input: LoginInput): Promise<User> {
    const data = loginSchema.parse(input);
    const passwordHash = await hashPassword(data.password);
    const user = authStorage.readUser();
    if (!user || user.email !== data.email || user.passwordHash !== passwordHash) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    authStorage.saveSession({ userId: user.id });
    return publicUser(user);
  },

  logout() {
    authStorage.removeSession();
  },
};
