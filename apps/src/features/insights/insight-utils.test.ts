import { buildInsights } from './insight-utils';

describe('buildInsights', () => {
  it('prioritizes stock and open-balance actions', () => {
    const result = buildInsights({
      inventory: [{ id: 'i1', name: 'Rice', category: 'Grains', unit: 'bag', stock: 1, dailyRequirement: 2, reorderLevel: 5, purchaseCost: 100, sellingPrice: 120, supplier: 'Supplier' }],
      sales: [{ id: 's1', customer: 'Cafe', date: '2026-08-01', total: 1000, cost: 900, payment: 'Credit', itemCount: 1 }],
      bills: [{ id: 'b1', vendor: 'Supplier', invoice: 'B1', date: '2026-08-01', total: 500, vat: 50, payment: 'Credit', status: 'saved' }],
    });
    expect(result[0].id).toBe('low-stock');
    expect(result.some(item => item.id === 'receivables')).toBe(true);
    expect(result.some(item => item.id === 'payables')).toBe(true);
  });
});
