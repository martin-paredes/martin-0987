import cors from 'cors';
import express from 'express';
import { paymentRoutes } from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/payments', paymentRoutes);
app.use(errorHandler);
