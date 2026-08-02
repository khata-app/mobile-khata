import { z } from 'zod';

export const businessIdSchema = z.string().uuid();
export const moneyPaisaSchema = z.number().int().nonnegative();

export const voucherLineSchema = z.object({
  accountId: z.string().uuid(),
  debitPaisa: moneyPaisaSchema.nonnegative().default(0),
  creditPaisa: moneyPaisaSchema.nonnegative().default(0),
  description: z.string().max(500).optional(),
});

export const createVoucherSchema = z.object({
  businessId: businessIdSchema,
  voucherType: z.enum(['sales', 'purchase', 'payment', 'receipt', 'contra', 'journal']),
  transactionDate: z.string(),
  idempotencyKey: z.string().min(16).max(128),
  lines: z.array(voucherLineSchema).min(2),
});

export type CreateVoucher = z.infer<typeof createVoucherSchema>;

export function isBalancedVoucher(voucher: CreateVoucher): boolean {
  const debit = voucher.lines.reduce((sum, line) => sum + line.debitPaisa, 0);
  const credit = voucher.lines.reduce((sum, line) => sum + line.creditPaisa, 0);
  return debit > 0 && debit === credit && voucher.lines.every(line =>
    (line.debitPaisa === 0) !== (line.creditPaisa === 0));
}
