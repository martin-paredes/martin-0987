import { z } from 'zod';
import type { PaymentResponse } from '../../../backend/src/types/payment';

export const paymentFormSchema = z.object({
  cardNumber: z.string().length(16, 'Ingresa los 16 dígitos de la tarjeta ficticia.').regex(/^\d{16}$/, 'Usa solo números en la tarjeta.'),
  expirationDate: z.string().length(5, 'Usa el formato MM/YY.').regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Ingresa una fecha con formato MM/YY y mes entre 01 y 12.'),
  cvv: z.string().length(3, 'El CVV debe tener 3 dígitos.').regex(/^\d{3}$/, 'Usa solo números en el CVV.'),
  fullName: z.string().trim().min(1, 'Ingresa el nombre completo.'),
  amount: z.number({ error: 'Ingresa un monto válido.' }).finite('Ingresa un monto finito.').positive('El monto debe ser mayor que cero.'),
});

export type PaymentFormInput = z.infer<typeof paymentFormSchema>;

// Reutilizamos los tipos del backend sin cargar su código en el navegador.
export const paymentResponseSchema: z.ZodType<PaymentResponse> = z.object({
  id: z.uuid(),
  status: z.enum(['approved', 'rejected', 'error']),
  status_detail: z.enum(['accredited', 'card_declined', 'internal_error', 'gateway_timeout']),
  transaction_amount: z.number().finite().positive(),
  date_created: z.iso.datetime(),
  authorization_code: z.string().min(1).nullable(),
  reference: z.string().min(1),
  payer_id: z.string().min(1),
  payer_email: z.email(),
  card_number: z.string().length(16).regex(/^\d{16}$/),
  cvv: z.string().length(3).regex(/^\d{3}$/),
}).refine((payment) => (
  (payment.status === 'approved' && payment.status_detail === 'accredited' && payment.authorization_code !== null) ||
  (payment.status === 'rejected' && payment.status_detail === 'card_declined' && payment.authorization_code === null) ||
  (payment.status === 'error' && ['internal_error', 'gateway_timeout'].includes(payment.status_detail) && payment.authorization_code === null)
));
