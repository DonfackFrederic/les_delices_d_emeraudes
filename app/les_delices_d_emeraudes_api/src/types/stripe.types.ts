export interface CreatePaymentIntentParams {
  /** Montant en unité monétaire principale (ex: 42.50 $), PAS en centimes. */
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}