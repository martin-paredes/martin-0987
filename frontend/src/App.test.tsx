import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router';
import App from './App';
import { authService } from './services/authService';
import { AUTH_KEYS, authStorage } from './services/authStorage';
import { credentials, registration } from './test/authFixtures';

function CurrentPath() {
  return <output data-testid="path">{useLocation().pathname}</output>;
}

function openApp(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /><CurrentPath /></MemoryRouter>);
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function signIn(password = credentials.password) {
  await screen.findByRole('heading', { name: 'Iniciar sesión' });
  fill('Correo electrónico', credentials.email);
  fill('Contraseña', password);
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

test.each(['/dashboard', '/unknown', '/'])('redirects unauthenticated %s to login', async (path) => {
  openApp(path);
  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  expect(screen.getByTestId('path')).toHaveTextContent('/login');
});

test('validates registration and completes registration, login, reload, logout and login again', async () => {
  const app = openApp('/register');
  await screen.findByRole('heading', { name: 'Crear cuenta' });
  fill('Nombre completo', ' ');
  fill('Correo electrónico', 'no-es-correo');
  fill('Contraseña', 'corta');
  fill('Confirmar contraseña', 'diferente');
  fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(await screen.findByText('Ingresa un correo válido.')).toBeVisible();
  expect(screen.getByText('Ingresa un nombre de al menos 2 caracteres.')).toBeVisible();
  expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeVisible();
  expect(screen.getByText('Las contraseñas no coinciden.')).toBeVisible();
  fill('Nombre completo', registration.fullName);
  fill('Correo electrónico', registration.email);
  fill('Contraseña', registration.password);
  fill('Confirmar contraseña', registration.confirmPassword);
  fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(await screen.findByText('Cuenta creada. Ya puedes iniciar sesión.')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(authStorage.readSession()).toBeNull();
  await signIn('incorrecta');
  expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeVisible();
  expect(screen.getByTestId('path')).toHaveTextContent('/login');
  await signIn();
  expect(await screen.findByRole('heading', { name: 'Hola, Persona Demo' })).toBeVisible();
  expect(screen.getByText('Saldo actual: $0')).toBeVisible();
  const storedUser = authStorage.readUser();
  app.unmount();
  openApp('/dashboard');
  expect(await screen.findByRole('heading', { name: 'Hola, Persona Demo' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  expect(authStorage.readSession()).toBeNull();
  expect(authStorage.readUser()).toEqual(storedUser);
  await signIn();
  expect(await screen.findByRole('heading', { name: 'Hola, Persona Demo' })).toBeVisible();
});

test.each(['/dashboard', '/login', '/register', '/unknown'])('restores authenticated access from %s', async (path) => {
  await authService.register(registration);
  await authService.login(credentials);
  openApp(path);
  expect(await screen.findByRole('heading', { name: 'Hola, Persona Demo' })).toBeVisible();
  expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
});

test('shows pending login state while Web Crypto runs', async () => {
  await authService.register(registration);
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(credentials.password));
  let finish: (value: ArrayBuffer) => void = () => {};
  vi.spyOn(crypto.subtle, 'digest').mockImplementation(() => new Promise<ArrayBuffer>((resolve) => { finish = resolve; }));
  openApp('/login');
  await signIn();
  expect(await screen.findByRole('button', { name: 'Ingresando…' })).toBeDisabled();
  finish(buffer);
  expect(await screen.findByRole('heading', { name: 'Hola, Persona Demo' })).toBeVisible();
});

test('does not enter dashboard if persisting the session fails', async () => {
  await authService.register(registration);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  openApp('/login');
  await signIn();
  expect(await screen.findByRole('alert')).toHaveTextContent('almacenamiento local');
  expect(screen.getByTestId('path')).toHaveTextContent('/login');
});

test('reports failed logout without pretending the session was removed', async () => {
  await authService.register(registration);
  await authService.login(credentials);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
  openApp('/dashboard');
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('almacenamiento local');
  expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
  expect(authStorage.readSession()).not.toBeNull();
});

test('reacts to logout in another tab', async () => {
  await authService.register(registration);
  await authService.login(credentials);
  openApp('/dashboard');
  authStorage.removeSession();
  fireEvent(window, new StorageEvent('storage', { key: AUTH_KEYS.session }));
  await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/login'));
});
