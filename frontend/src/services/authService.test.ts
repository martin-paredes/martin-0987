import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { authService } from './authService';
import { AUTH_KEYS, authStorage } from './authStorage';
import { credentials, registration } from '../test/authFixtures';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

test('registers a normalized user with zero balance and only a password hash', async () => {
  await authService.register(registration);
  const user = authStorage.readUser();
  expect(user).toMatchObject({ fullName: 'Persona Demo', email: credentials.email, balance: 0 });
  expect(user?.id).toMatch(/^[a-f0-9-]{36}$/);
  expect(user?.passwordHash).toMatch(/^[a-f0-9]{64}$/);
  const raw = localStorage.getItem(AUTH_KEYS.user)!;
  expect(Object.keys(JSON.parse(raw)).sort()).toEqual(['balance', 'email', 'fullName', 'id', 'passwordHash']);
  expect(raw).not.toContain(registration.password);
  expect(raw).not.toContain('confirmPassword');
  expect(authService.restore()).toBeNull();
});

test('uses SHA-256 with a known test vector', async () => {
  await authService.register({ ...registration, password: 'password', confirmPassword: 'password' });
  expect(authStorage.readUser()?.passwordHash).toBe('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
});

test.each([
  { email: 'incorrecto' },
  { fullName: '   ' },
  { password: 'corta', confirmPassword: 'corta' },
  { confirmPassword: 'otra contraseña' },
])('rejects invalid registration: %j', async (invalid) => {
  await expect(authService.register({ ...registration, ...invalid })).rejects.toThrow();
  expect(authStorage.readUser()).toBeNull();
});

test('does not overwrite an existing account', async () => {
  await authService.register(registration);
  const original = authStorage.readUser();
  await expect(authService.register({ ...registration, email: 'other@example.test' })).rejects.toThrow('Ya existe un usuario');
  expect(authStorage.readUser()).toEqual(original);
});

test('normalizes login, restores session, and preserves user and balance on logout', async () => {
  await authService.register(registration);
  const stored = authStorage.readUser()!;
  authStorage.saveUser({ ...stored, balance: 25 });
  const user = await authService.login({ ...credentials, email: ` ${credentials.email.toUpperCase()} ` });
  expect(user).not.toHaveProperty('passwordHash');
  expect(JSON.parse(localStorage.getItem(AUTH_KEYS.session)!)).toEqual({ userId: stored.id });
  expect(authService.restore()).toEqual(user);
  localStorage.setItem('unrelated.setting', 'preserved');
  authService.logout();
  expect(localStorage.getItem(AUTH_KEYS.session)).toBeNull();
  expect(authStorage.readUser()).toEqual({ ...stored, balance: 25 });
  expect(localStorage.getItem('unrelated.setting')).toBe('preserved');
  expect(authService.restore()).toBeNull();
  expect(await authService.login(credentials)).toEqual(user);
});

test.each([
  { ...credentials, password: 'Contraseña incorrecta' },
  { ...credentials, email: 'other@example.test' },
])('rejects incorrect credentials with a generic message: %j', async (input) => {
  await authService.register(registration);
  await expect(authService.login(input)).rejects.toThrow('Correo o contraseña incorrectos.');
  expect(authStorage.readSession()).toBeNull();
});

test('rejects login when no user is registered', async () => {
  await expect(authService.login(credentials)).rejects.toThrow('Correo o contraseña incorrectos.');
});

test.each(['{broken', 'null', '{}', '{"userId":12}'])('ignores malformed session: %s', async (raw) => {
  await authService.register(registration);
  localStorage.setItem(AUTH_KEYS.session, raw);
  expect(authService.restore()).toBeNull();
});

test.each(['{broken', 'null', '{}', '{"balance":"0"}'])('ignores malformed user: %s', (raw) => {
  localStorage.setItem(AUTH_KEYS.user, raw);
  expect(authService.restore()).toBeNull();
});

test('rejects a session belonging to another user', async () => {
  await authService.register(registration);
  authStorage.saveSession({ userId: crypto.randomUUID() });
  expect(authService.restore()).toBeNull();
});

test('reports write failures without reporting a successful login', async () => {
  await authService.register(registration);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  await expect(authService.login(credentials)).rejects.toThrow('almacenamiento local');
  expect(authService.restore()).toBeNull();
});

test('reports read failures without replacing the user', async () => {
  await authService.register(registration);
  const original = authStorage.readUser();
  const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  await expect(authService.register(registration)).rejects.toThrow('almacenamiento local');
  getItem.mockRestore();
  expect(authStorage.readUser()).toEqual(original);
});

test('reports unavailable Web Crypto', async () => {
  vi.stubGlobal('crypto', {});
  try {
    await expect(authService.register(registration)).rejects.toThrow('Web Crypto');
    expect(authStorage.readUser()).toBeNull();
  } finally {
    vi.unstubAllGlobals();
  }
});
