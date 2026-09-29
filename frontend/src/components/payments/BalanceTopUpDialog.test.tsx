import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import App from '../../App';
import { authService } from '../../services/authService';
import { AUTH_KEYS, authStorage } from '../../services/authStorage';
import { LAST_TRANSACTION_KEY } from '../../services/paymentStorage';
import { registration, credentials } from '../../test/authFixtures';
import type { PaymentResponse } from '../../../../backend/src/types/payment';

const card = '1234123412341234';
const cvv = '543';

function response(overrides: Partial<PaymentResponse> = {}): PaymentResponse {
  const user = authStorage.readUser()!;
  return {
    id: crypto.randomUUID(), status: 'approved', status_detail: 'accredited',
    transaction_amount: 100, date_created: new Date().toISOString(),
    authorization_code: 'AUTH-DEMO', reference: 'PAY-DEMO', payer_id: user.id,
    payer_email: user.email, card_number: card, cvv, ...overrides,
  };
}

function openApp() {
  return render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
}

async function openForm() {
  fireEvent.click(await screen.findByRole('button', { name: 'Cargar saldo' }, { timeout: 5000 }));
  const dialog = await screen.findByRole('dialog', { name: 'Cargar saldo' });
  for (const [label, value] of [['Número de tarjeta', card], ['Fecha de vencimiento', '12/26'], ['CVV', cvv], ['Monto de recarga', '999']]) {
    fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
  }
  return dialog;
}

beforeEach(async () => {
  localStorage.clear();
  await authService.register(registration);
  await authService.login(credentials);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test('credits only the approved amount once, adds successive top ups and restores the balance', async () => {
  const payment = response();
  let resolveRequest: (value: Response) => void = () => {};
  const fetchMock = vi.fn().mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveRequest = resolve; }));
  vi.stubGlobal('fetch', fetchMock);
  const app = openApp();
  const dialog = await openForm();
  const form = within(dialog).getByRole('button', { name: 'Realizar recarga' }).closest('form')!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(await screen.findByRole('button', { name: 'Procesando…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(sent).toMatchObject({ amount: 999, payerId: payment.payer_id, payerEmail: payment.payer_email });
  expect(within(dialog).queryByLabelText('payerId')).not.toBeInTheDocument();
  resolveRequest(new Response(JSON.stringify(payment), { status: 200 }));
  expect(await screen.findByText('Recarga aprobada. Tu saldo fue actualizado.')).toBeVisible();
  expect(screen.getByText('$100.00')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(100);
  expect(JSON.parse(localStorage.getItem(LAST_TRANSACTION_KEY)!)).toMatchObject({ id: payment.id, cardNumber: card, cvv, transactionAmount: 100 });
  expect(authStorage.readUser()).not.toHaveProperty('cvv');

  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(response({ transaction_amount: 50.5 })), { status: 200 }));
  const secondDialog = await openForm();
  fireEvent.click(within(secondDialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('$150.50')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(150.5);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  app.unmount();
  openApp();
  expect(await screen.findByText('$150.50')).toBeVisible();
  authService.logout();
  expect((await authService.login(credentials)).balance).toBe(150.5);
}, 15000);

test.each([
  { status: 'rejected' as const, detail: 'card_declined' as const, http: 402, message: 'La transacción fue rechazada. Verifica los datos e intenta nuevamente.' },
  { status: 'error' as const, detail: 'internal_error' as const, http: 500, message: 'No fue posible procesar la recarga. Intenta nuevamente.' },
])('persists a processed $status response without changing balance', async ({ status, detail, http, message }) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response({ status, status_detail: detail, authorization_code: null })), { status: http })));
  openApp();
  const dialog = await openForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText(message)).toBeVisible();
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Realizar recarga' })).toBeEnabled();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(JSON.parse(localStorage.getItem(LAST_TRANSACTION_KEY)!)).toMatchObject({ status, cardNumber: card, cvv });
});

test('keeps balance and previous receipt unchanged on network failure and allows retry', async () => {
  localStorage.setItem(LAST_TRANSACTION_KEY, 'previous-receipt');
  const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Network error'));
  vi.stubGlobal('fetch', fetchMock);
  openApp();
  const dialog = await openForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('No fue posible comunicarse con el servicio. Verifica la conexión e intenta nuevamente.')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(localStorage.getItem(LAST_TRANSACTION_KEY)).toBe('previous-receipt');
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(response()), { status: 200 }));
  fireEvent.click(screen.getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('$100.00')).toBeVisible();
});

test('validates the form before sending and discards cancelled inputs', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  openApp();
  const dialog = await openForm();
  fireEvent.change(within(dialog).getByLabelText('Monto de recarga'), { target: { value: '0' } });
  fireEvent.change(within(dialog).getByLabelText('CVV'), { target: { value: 'a' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('El monto debe ser mayor que cero.')).toBeVisible();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(localStorage.getItem(LAST_TRANSACTION_KEY)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cargar saldo' }));
  expect(await screen.findByLabelText('Número de tarjeta')).toHaveValue('');
  expect(screen.getByLabelText('CVV')).toHaveValue('');
});

test('does not credit a response for a different payer or an invalid contract', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(response({ payer_id: crypto.randomUUID() })), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  openApp();
  const dialog = await openForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('El servicio devolvió una respuesta inesperada. No se actualizó el saldo.')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(localStorage.getItem(LAST_TRANSACTION_KEY)).toBeNull();
  fetchMock.mockResolvedValueOnce(new Response('{"status":"approved"}', { status: 200 }));
  fireEvent.click(screen.getByRole('button', { name: 'Realizar recarga' }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(await screen.findByText('El servicio devolvió una respuesta inesperada. No se actualizó el saldo.')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(localStorage.getItem(LAST_TRANSACTION_KEY)).toBeNull();
});

test('does not show success if persisting an approved balance fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response()), { status: 200 })));
  const originalSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === AUTH_KEYS.user) throw new Error('blocked');
    originalSet.call(this, key, value);
  });
  openApp();
  const dialog = await openForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Realizar recarga' }));
  expect(await screen.findByText('La recarga fue aprobada, pero no se pudo guardar el nuevo saldo. El saldo local no cambió.')).toBeVisible();
  expect(authStorage.readUser()?.balance).toBe(0);
  expect(screen.queryByText('Recarga aprobada. Tu saldo fue actualizado.')).not.toBeInTheDocument();
});
