import { expect, test, vi } from 'vitest';
import { PAYMENT_TIMEOUT_MS, processPayment } from './paymentService';
import { API_BASE_URL } from '../config';
import { authService } from './authService';
import { authStorage } from './authStorage';
import { registration, credentials } from '../test/authFixtures';
import { LAST_TRANSACTION_KEY } from './paymentStorage';

test.each([
  { failure: 'interrupted body', kind: 'network' },
  { failure: 'non-JSON server error', kind: 'system' },
])('classifies $failure without exposing technical details', async ({ failure, kind }) => {
  const response = failure === 'interrupted body'
    ? new Response(new ReadableStream({ start(controller) { controller.error(new TypeError('Connection terminated')); } }))
    : new Response('<html>Internal Server Error</html>', { status: 500 });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  try {
    await expect(processPayment({
      cardNumber: '1234123412341234', expirationDate: '12/26', cvv: '543',
      fullName: 'Persona Demo', amount: 100, payerId: 'demo-user', payerEmail: 'demo@example.test',
    })).rejects.toMatchObject({ kind });
  } finally {
    vi.unstubAllGlobals();
  }
});

test('aborts at 2000ms, distinguishes timeout from cancellation and leaves storage unchanged', async () => {
  localStorage.clear();
  await authService.register(registration);
  const user = await authService.login(credentials);
  const input = { cardNumber: '5555555555554444', expirationDate: '12/26', cvv: '543', fullName: user.fullName, amount: 100, payerId: user.id, payerEmail: user.email };
  let requestSignal: AbortSignal | undefined;
  const fetchMock = vi.fn((_url: string, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
    requestSignal = options.signal as AbortSignal;
    requestSignal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  vi.stubGlobal('fetch', fetchMock);
  vi.useFakeTimers();
  try {
    const request = processPayment(input);
    const rejection = expect(request).rejects.toMatchObject({ kind: 'timeout', message: 'La operación tardó demasiado. Intenta nuevamente.' });
    expect(PAYMENT_TIMEOUT_MS).toBe(2000);
    await vi.advanceTimersByTimeAsync(PAYMENT_TIMEOUT_MS - 1);
    expect(requestSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(requestSignal?.aborted).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/payments`);
    expect(authStorage.readUser()?.balance).toBe(0);
    expect(localStorage.getItem(LAST_TRANSACTION_KEY)).toBeNull();
    const controller = new AbortController();
    const cancelled = processPayment(input, controller.signal);
    const cancelRejection = expect(cancelled).rejects.toMatchObject({ kind: 'cancelled' });
    controller.abort();
    await cancelRejection;
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
