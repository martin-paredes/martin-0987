import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().min(1, 'Ingresa tu correo electrónico.').email('Ingresa un correo válido.');
const nameSchema = z.string().trim().min(2, 'Ingresa un nombre de al menos 2 caracteres.');

export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export const storedUserSchema = z.strictObject({
  id: z.uuid(),
  fullName: nameSchema,
  email: emailSchema,
  passwordHash: z.string().regex(/^[a-f0-9]{64}$/),
  balance: z.number().finite().nonnegative(),
});

export const sessionSchema = z.strictObject({ userId: z.uuid() });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StoredUser = z.infer<typeof storedUserSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type User = Omit<StoredUser, 'passwordHash'>;
