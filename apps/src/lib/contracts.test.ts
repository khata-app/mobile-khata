import { createVoucherSchema, isBalancedVoucher } from '@khata/contracts';

const base = {
  businessId: '11111111-1111-4111-8111-111111111111',
  voucherType: 'journal' as const,
  transactionDate: '2026-08-02',
  idempotencyKey: 'offline-command-000001',
};

test('accepts a balanced voucher with mutually exclusive line sides', () => {
  const voucher = createVoucherSchema.parse({ ...base, lines: [
    { accountId: '22222222-2222-4222-8222-222222222222', debitPaisa: 1000 },
    { accountId: '33333333-3333-4333-8333-333333333333', creditPaisa: 1000 },
  ] });
  expect(isBalancedVoucher(voucher)).toBe(true);
});

test('detects an unbalanced voucher', () => {
  const voucher = createVoucherSchema.parse({ ...base, lines: [
    { accountId: '22222222-2222-4222-8222-222222222222', debitPaisa: 1000 },
    { accountId: '33333333-3333-4333-8333-333333333333', creditPaisa: 999 },
  ] });
  expect(isBalancedVoucher(voucher)).toBe(false);
});
