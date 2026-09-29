import { loginSchema, registerSchema } from '../auth/schemas';
import type { LoginInput, RegisterInput, StoredUser, User } from '../auth/schemas';
import { authStorage } from './authStorage';
import type { PaymentResponse } from '../../../backend/src/types/payment';
import { paymentResponseSchema } from '../schemas/paymentSchema';
import { saveLastTransaction } from './paymentStorage';

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

  applyPayment(response: PaymentResponse): User {
    const payment = paymentResponseSchema.parse(response);
    const user = authStorage.readUser();
    const session = authStorage.readSession();
    if (!user || session?.userId !== user.id || payment.payer_id !== user.id || payment.payer_email !== user.email) {
      throw new Error('La sesión cambió. Inicia sesión nuevamente antes de recargar.');
    }
    saveLastTransaction(payment);
    if (payment.status !== 'approved') return publicUser(user);

    const balance = Number((user.balance + payment.transaction_amount).toFixed(2));
    if (!Number.isFinite(balance)) throw new Error('El importe recibido no permite actualizar el saldo.');
    const updatedUser = { ...user, balance };
    try {
      authStorage.saveUser(updatedUser);
    } catch {
      throw new Error('La recarga fue aprobada, pero no se pudo guardar el nuevo saldo. El saldo local no cambió.');
    }
    return publicUser(updatedUser);
  },

  logout() {
    authStorage.removeSession();
  },
};
