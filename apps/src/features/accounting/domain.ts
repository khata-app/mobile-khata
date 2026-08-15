export const voucherTypes = [
  'sales',
  'purchase',
  'payment',
  'receipt',
  'contra',
  'journal',
  'credit_note',
  'debit_note',
  'stock_journal',
] as const;

export type VoucherType = (typeof voucherTypes)[number];

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export type Account = {
  id: string;
  businessId: string;
  code: string;
  name: string;
  accountType: AccountType;
  isSystem: boolean;
  isActive: boolean;
};

export type VoucherLineInput = {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
};

export type PostVoucherInput = {
  businessId: string;
  voucherType: VoucherType;
  transactionDate: string;
  idempotencyKey: string;
  narration?: string;
  referenceType?: string;
  referenceId?: string;
  lines: VoucherLineInput[];
};

export type PostedVoucher = {
  id: string;
  voucherType: VoucherType;
  transactionDate: string;
  status: 'posted' | 'reversed';
};

export function toPaisa(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

export function fromPaisa(value: number) {
  return Math.round(value) / 100;
}

export function totalDebit(lines: VoucherLineInput[]) {
  return lines.reduce((sum, line) => sum + toPaisa(line.debit), 0);
}

export function totalCredit(lines: VoucherLineInput[]) {
  return lines.reduce((sum, line) => sum + toPaisa(line.credit), 0);
}

export function isBalanced(lines: VoucherLineInput[]) {
  const debit = totalDebit(lines);
  const credit = totalCredit(lines);
  return lines.length >= 2 && debit > 0 && debit === credit;
}

export function validateVoucher(input: PostVoucherInput) {
  if (!input.businessId) throw new Error('Business is required');
  if (!voucherTypes.includes(input.voucherType)) throw new Error('Unsupported voucher type');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.transactionDate)) throw new Error('Transaction date must be YYYY-MM-DD');
  if (!input.idempotencyKey.trim()) throw new Error('Idempotency key is required');
  if (input.lines.some(line => !line.accountId || (toPaisa(line.debit) > 0 && toPaisa(line.credit) > 0) || (toPaisa(line.debit) === 0 && toPaisa(line.credit) === 0))) {
    throw new Error('Each voucher line must contain exactly one positive amount');
  }
  if (!isBalanced(input.lines)) throw new Error('Voucher is not balanced');
}

export function validPan(value: string) {
  return /^\d{9}$/.test(value.trim());
}

