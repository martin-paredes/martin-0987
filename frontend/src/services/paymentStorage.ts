import type { PaymentResponse } from '../../../backend/src/types/payment';

export const LAST_TRANSACTION_KEY = 'fullstack.payment.lastTransaction';

// Guardamos la tarjeta y el CVV ficticios porque lo pide el ejercicio
export function saveLastTransaction(payment: PaymentResponse) {
  try {
    localStorage.setItem(LAST_TRANSACTION_KEY, JSON.stringify({
      id: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      transactionAmount: payment.transaction_amount,
      dateCreated: payment.date_created,
      payerId: payment.payer_id,
      cardNumber: payment.card_number,
      cvv: payment.cvv,
    }));
  } catch {
    throw new Error('Se recibió una respuesta, pero no se pudo guardar en este navegador. El saldo no cambió.');
  }
}
