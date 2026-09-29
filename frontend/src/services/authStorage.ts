import { z } from 'zod';
import { sessionSchema, storedUserSchema } from '../auth/schemas';
import type { Session, StoredUser } from '../auth/schemas';

export const AUTH_KEYS = {
  user: 'fullstack.auth.user',
  session: 'fullstack.auth.session',
} as const;

const storageError = () => new Error('No se pudo acceder al almacenamiento local. Revisa los permisos del navegador e inténtalo de nuevo.');

function read<T>(key: string, schema: z.ZodType<T>): T | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    throw storageError();
  }
  if (raw === null) return null;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function write(key: string, value: StoredUser | Session) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw storageError();
  }
}

export const authStorage = {
  readUser: () => read(AUTH_KEYS.user, storedUserSchema),
  readSession: () => read(AUTH_KEYS.session, sessionSchema),
  saveUser: (user: StoredUser) => write(AUTH_KEYS.user, storedUserSchema.parse(user)),
  saveSession: (session: Session) => write(AUTH_KEYS.session, sessionSchema.parse(session)),
  removeSession() {
    try {
      localStorage.removeItem(AUTH_KEYS.session);
    } catch {
      throw storageError();
    }
  },
};
