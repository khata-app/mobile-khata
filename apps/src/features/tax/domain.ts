export type TaxRate = { code: string; name: string; rate: number; kind: 'vat' | 'tds' };

export const defaultTaxRates: TaxRate[] = [
  { code: 'VAT13', name: 'Nepal VAT', rate: 13, kind: 'vat' },
  { code: 'TDS1.5', name: 'TDS 1.5%', rate: 1.5, kind: 'tds' },
  { code: 'TDS10', name: 'TDS 10%', rate: 10, kind: 'tds' },
];

const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInclusiveTax(gross: number, rate: number) {
  const safeGross = Math.max(0, gross);
  const safeRate = Math.max(0, rate);
  const tax = safeRate === 0 ? 0 : rounded(safeGross - (safeGross / (100 + safeRate) * 100));
  return { taxable: rounded(safeGross - tax), tax, gross: rounded(safeGross), rate: safeRate };
}

export function calculateExclusiveTax(taxable: number, rate: number) {
  const safeTaxable = Math.max(0, taxable);
  const tax = rounded(safeTaxable * Math.max(0, rate) / 100);
  return { taxable: rounded(safeTaxable), tax, gross: rounded(safeTaxable + tax), rate: Math.max(0, rate) };
}

export function calculateTds(base: number, rate: number) {
  const safeBase = Math.max(0, base);
  const safeRate = Math.max(0, rate);
  return { base: rounded(safeBase), tax: rounded(safeBase * safeRate / 100), rate: safeRate };
}
