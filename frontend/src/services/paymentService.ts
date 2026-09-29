import type { PaymentRequest } from '../../../backend/src/schemas/paymentSchema';
import type { PaymentResponse } from '../../../backend/src/types/payment';
import { API_BASE_URL } from '../config';
import { paymentResponseSchema } from '../schemas/paymentSchema';

export const PAYMENT_TIMEOUT_MS = 2000;

const messages = {
  validation: 'Revisa los datos de la recarga e intenta nuevamente.',
  system: 'No fue posible procesar la recarga. Intenta nuevamente.',
  timeout: 'La operación tardó demasiado. Intenta nuevamente.',
  network: 'No fue posible comunicarse con el servicio. Verifica la conexión e intenta nuevamente.',
  cancelled: 'La operación fue cancelada.',
  invalidResponse: 'El servicio devolvió una respuesta inesperada. No se actualizó el saldo.',
};

export class PaymentError extends Error {
  constructor(public readonly kind: keyof typeof messages) {
    super(messages[kind]);
    this.name = 'PaymentError';
  }
}

export async function processPayment(input: PaymentRequest, signal?: AbortSignal): Promise<PaymentResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, PAYMENT_TIMEOUT_MS);

  try {
    controller.signal.throwIfAborted();
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (response.status === 400) throw new PaymentError('validation');
    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new PaymentError(response.status >= 500 ? 'system' : 'invalidResponse');
      }
      throw error;
    }
    controller.signal.throwIfAborted();
    const result = paymentResponseSchema.safeParse(body);
    if (!result.success) {
      throw new PaymentError(response.status >= 500 ? 'system' : 'invalidResponse');
    }
    const payment = result.data;
    const expectedStatus = { approved: 200, rejected: 402, error: 500 };
    if (response.status !== expectedStatus[payment.status] ||
      payment.payer_id !== input.payerId || payment.payer_email !== input.payerEmail.trim().toLowerCase() ||
      payment.card_number !== input.cardNumber || payment.cvv !== input.cvv) {
      throw new PaymentError('invalidResponse');
    }
    return payment;
  } catch (error) {
    if (controller.signal.aborted) throw new PaymentError(timedOut ? 'timeout' : 'cancelled');
    if (error instanceof PaymentError) throw error;
    throw new PaymentError('network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
