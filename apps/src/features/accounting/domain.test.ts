import { isBalanced, toPaisa, totalCredit, totalDebit, validPan, validateVoucher } from './domain';

const lines = [
  { accountId: 'cash', debit: 100.005, credit: 0 },
  { accountId: 'sales', debit: 0, credit: 100.005 },
];

describe('accounting domain', () => {
  it('rounds money to paisa before comparing totals', () => {
    expect(toPaisa(100.005)).toBe(10001);
    expect(totalDebit(lines)).toBe(10001);
    expect(totalCredit(lines)).toBe(10001);
    expect(isBalanced(lines)).toBe(true);
  });

  it('rejects unbalanced or empty voucher lines', () => {
    expect(() => validateVoucher({ businessId: 'business', voucherType: 'journal', transactionDate: '2026-08-15', idempotencyKey: 'test', lines: [{ accountId: 'cash', debit: 10, credit: 0 }] })).toThrow('not balanced');
    expect(() => validateVoucher({ businessId: 'business', voucherType: 'journal', transactionDate: '2026-08-15', idempotencyKey: 'test', lines: [{ accountId: 'cash', debit: 10, credit: 10 }, { accountId: 'sales', debit: 0, credit: 0 }] })).toThrow('exactly one');
  });

  it('validates Nepali PAN format', () => {
    expect(validPan('604812345')).toBe(true);
    expect(validPan('123')).toBe(false);
    expect(validPan('60481234A')).toBe(false);
  });
});

