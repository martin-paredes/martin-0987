import request from 'supertest';
import { expect, test, vi } from 'vitest';
import { app } from '../app.js';
import { paymentSchema } from '../schemas/paymentSchema.js';
import { processPayment, SLOW_RESPONSE_MS, SUCCESS_CVV, SUCCESS_EXPIRATION, TEST_CARDS } from '../services/snailPayService.js';

const validRequest = {
  cardNumber: TEST_CARDS.success,
  expirationDate: SUCCESS_EXPIRATION,
  cvv: SUCCESS_CVV,
  fullName: ' Persona Demo ',
  amount: 125.5,
  payerId: ' demo-user ',
  payerEmail: ' DEMO@example.test ',
};

function expectContract(body: unknown, cardNumber: string) {
  expect(body).toEqual({
    id: expect.any(String),
    status: expect.any(String),
    status_detail: expect.any(String),
    transaction_amount: 125.5,
    date_created: expect.any(String),
    authorization_code: expect.toSatisfy((value: unknown) => value === null || typeof value === 'string'),
    reference: expect.stringMatching(/^PAY-/),
    payer_id: 'demo-user',
    payer_email: 'demo@example.test',
    card_number: cardNumber,
    cvv: SUCCESS_CVV,
  });
}

test('approves only the success credentials and returns the complete contract', async () => {
  const response = await request(app).post('/api/payments').send(validRequest);
  expect(response.status).toBe(200);
  expectContract(response.body, TEST_CARDS.success);
  expect(response.body).toMatchObject({ status: 'approved', status_detail: 'accredited', authorization_code: expect.stringMatching(/^AUTH-[A-F0-9]{8}$/) });
  expect(response.body.id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  expect(new Date(response.body.date_created).toISOString()).toBe(response.body.date_created);
  const second = await request(app).post('/api/payments').send(validRequest);
  expect(second.body.id).not.toBe(response.body.id);
  expect(second.body.reference).not.toBe(response.body.reference);
});

test('rejects invalid input before creating a transaction, including malformed JSON', async () => {
  const response = await request(app).post('/api/payments').send({ ...validRequest, amount: 0, payerEmail: 'incorrecto', fullName: ' ', cardNumber: '123', cvv: 'ab3', expirationDate: '13/26', payerId: ' ' });
  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: { code: 'invalid_payment_data', message: expect.any(String), fields: expect.arrayContaining(['amount', 'payerEmail', 'fullName', 'cardNumber', 'cvv', 'expirationDate', 'payerId']) } });
  expect(response.body).not.toHaveProperty('id');
  // JSON no admite NaN ni Infinity, así que los validamos directamente con el schema.
  for (const amount of [-1, NaN, Infinity, '12']) {
    expect(paymentSchema.safeParse({ ...validRequest, amount }).success).toBe(false);
  }
  // Un salto de línea al final también debe hacer que el campo sea inválido.
  for (const field of ['cardNumber', 'cvv', 'expirationDate'] as const) {
    expect(paymentSchema.safeParse({ ...validRequest, [field]: `${validRequest[field]}\n` }).success).toBe(false);
  }
  const malformed = await request(app).post('/api/payments').set('Content-Type', 'application/json').send('{broken');
  expect(malformed.status).toBe(400);
  expect(malformed.body).toEqual({ error: { code: 'invalid_request', message: expect.any(String) } });
});

test('returns a business rejection for declined, unknown and mismatched success credentials', async () => {
  for (const changes of [
    { cardNumber: TEST_CARDS.declined },
    { cardNumber: '1111111111111111' },
    { expirationDate: '11/26' },
    { cvv: '000' },
  ]) {
    const response = await request(app).post('/api/payments').send({ ...validRequest, ...changes });
    expect(response.status).toBe(402);
    expect(response.body).toMatchObject({ status: 'rejected', status_detail: 'card_declined', authorization_code: null });
    if (!('cvv' in changes)) expectContract(response.body, changes.cardNumber ?? TEST_CARDS.success);
  }
});

test('returns the payment contract for the deterministic system error', async () => {
  const response = await request(app).post('/api/payments').send({ ...validRequest, cardNumber: TEST_CARDS.systemError });
  expect(response.status).toBe(500);
  expectContract(response.body, TEST_CARDS.systemError);
  expect(response.body).toMatchObject({ status: 'error', status_detail: 'internal_error', authorization_code: null });
});

test('delays the slow scenario for 3000ms and never approves it', async () => {
  vi.useFakeTimers();
  try {
    const completed = vi.fn();
    const operation = processPayment(paymentSchema.parse({ ...validRequest, cardNumber: TEST_CARDS.slow }));
    void operation.then(completed);
    expect(SLOW_RESPONSE_MS).toBe(3000);
    await vi.advanceTimersByTimeAsync(SLOW_RESPONSE_MS - 1);
    expect(completed).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    const result = await operation;
    expectContract(result, TEST_CARDS.slow);
    expect(result).toMatchObject({ status: 'error', status_detail: 'gateway_timeout', authorization_code: null });
  } finally {
    vi.useRealTimers();
  }
});
