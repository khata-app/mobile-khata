import { calculateExclusiveTax, calculateInclusiveTax, calculateTds } from './domain';

describe('tax calculations', () => {
  it('splits an inclusive Nepal VAT amount without floating-point drift', () => {
    expect(calculateInclusiveTax(1130, 13)).toEqual({ taxable: 1000, tax: 130, gross: 1130, rate: 13 });
  });

  it('calculates exclusive VAT and TDS', () => {
    expect(calculateExclusiveTax(1000, 13).gross).toBe(1130);
    expect(calculateTds(1000, 1.5).tax).toBe(15);
  });
});
