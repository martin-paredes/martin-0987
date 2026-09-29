export type PaymentStatus = 'approved' | 'rejected' | 'error';

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  status_detail: 'accredited' | 'card_declined' | 'internal_error' | 'gateway_timeout';
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number: string;
  cvv: string;
}
