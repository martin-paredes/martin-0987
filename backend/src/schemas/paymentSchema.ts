import { z } from 'zod';

export const paymentSchema = z.object({
  cardNumber: z.string().length(16).regex(/^\d{16}$/),
  expirationDate: z.string().length(5).regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  cvv: z.string().length(3).regex(/^\d{3}$/),
  fullName: z.string().trim().min(1),
  amount: z.number().finite().positive(),
  payerId: z.string().trim().min(1),
  payerEmail: z.string().trim().toLowerCase().email(),
});

export type PaymentRequest = z.infer<typeof paymentSchema>;
