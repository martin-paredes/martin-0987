import { Router } from 'express';
import { paymentSchema } from '../schemas/paymentSchema.js';
import { processPayment } from '../services/snailPayService.js';
import type { PaymentStatus } from '../types/payment.js';

export const paymentRoutes = Router();
const httpStatus: Record<PaymentStatus, number> = { approved: 200, rejected: 402, error: 500 };

paymentRoutes.post('/', async (request, response) => {
  const result = paymentSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({
      error: {
        code: 'invalid_payment_data',
        message: 'Revisa los campos de la solicitud de pago.',
        fields: [...new Set(result.error.issues.map((issue) => issue.path.join('.') || 'body'))],
      },
    });
    return;
  }

  const payment = await processPayment(result.data);
  response.status(httpStatus[payment.status]).json(payment);
});
