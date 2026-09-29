import { randomUUID } from 'node:crypto';
import type { PaymentRequest } from '../schemas/paymentSchema.js';
import type { PaymentResponse, PaymentStatus } from '../types/payment.js';

// Cada tarjeta ficticia permite probar un resultado específico.
export const TEST_CARDS = {
  success: '1234123412341234',
  declined: '4000000000000002',
  systemError: '5000000000000000',
  slow: '5555555555554444',
} as const;
export const SUCCESS_EXPIRATION = '12/26';
export const SUCCESS_CVV = '543';
export const SLOW_RESPONSE_MS = 3000;

export async function processPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  let status: PaymentStatus = 'rejected';
  let detail: PaymentResponse['status_detail'] = 'card_declined';

  if (payment.cardNumber === TEST_CARDS.slow) {
    await new Promise<void>((resolve) => setTimeout(resolve, SLOW_RESPONSE_MS));
    status = 'error';
    detail = 'gateway_timeout';
  } else if (payment.cardNumber === TEST_CARDS.systemError) {
    status = 'error';
    detail = 'internal_error';
  } else if (
    payment.cardNumber === TEST_CARDS.success &&
    payment.expirationDate === SUCCESS_EXPIRATION &&
    payment.cvv === SUCCESS_CVV
  ) {
    status = 'approved';
    detail = 'accredited';
  }
  // Si los datos tienen un formato válido pero no coinciden con un caso especial, rechazamos el pago.
  const id = randomUUID();
  return {
    id,
    status,
    status_detail: detail,
    transaction_amount: payment.amount,
    date_created: new Date().toISOString(),
    authorization_code: status === 'approved' ? `AUTH-${id.slice(0, 8).toUpperCase()}` : null,
    reference: `PAY-${id}`,
    payer_id: payment.payerId,
    payer_email: payment.payerEmail,
    // Devolvemos la tarjeta y el CVV porque así lo pide esta simulación.
    // No se guardan ni se escriben en logs. Nunca usar datos reales aquí.
    card_number: payment.cardNumber,
    cvv: payment.cvv,
  };
}
