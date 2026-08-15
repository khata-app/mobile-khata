import { buildReports, reportRows, rowsToCsv } from './report-utils';

const input = {
  bills: [{ id: 'b1', vendor: 'Supplier', invoice: 'B-1', date: '2026-08-02', total: 1130, vat: 130, payment: 'Credit', status: 'saved' as const }],
  sales: [{ id: 's1', customer: 'Walk-in customer', date: '2026-08-03', total: 2260, cost: 1000, payment: 'Cash', itemCount: 2 }],
  expenses: [{ id: 'e1', category: 'Rent', description: 'Shop rent', date: '2026-08-04', amount: 200, payment: 'Cash' }],
  benefits: [{ id: 'benefit-1', employeeId: 'employee-1', type: 'Bonus', amount: 100, date: '2026-08-05', payment: 'Bank transfer' }],
  inventory: [{ id: 'i1', name: 'Rice', category: 'Grains', unit: 'kg', stock: 5, dailyRequirement: 2, reorderLevel: 5, purchaseCost: 100, sellingPrice: 140, supplier: 'Supplier' }],
};

describe('buildReports', () => {
  it('builds balanced journal totals and useful accounting summaries', () => {
    const result = buildReports(input, 'all');
    expect(result.dayBook.length).toBe(6);
    expect(result.trialBalance.totalDebit).toBe(result.trialBalance.totalCredit);
    expect(result.profitLoss.revenue).toBe(2260);
    expect(result.profitLoss.grossProfit).toBe(1260);
    expect(result.profitLoss.netProfit).toBe(960);
    expect(result.vatSummary.outputVat).toBeCloseTo(260, 4);
    expect(result.vatSummary.inputVat).toBe(130);
    expect(result.stockReport[0].low).toBe(true);
  });

  it('filters every source record by YYYY-MM period', () => {
    const result = buildReports(input, '2026-08');
    expect(result.dayBook).toHaveLength(6);
    expect(buildReports(input, '2026-07').dayBook).toHaveLength(0);
  });

  it('creates an Excel-compatible CSV from every report view', () => {
    const result = buildReports(input);
    const csv = rowsToCsv(reportRows(result, 'profit-loss'));
    expect(csv).toContain('"Line","Amount"');
    expect(csv).toContain('"Net profit"');
  });

  it('builds open-balance ageing and a VAT register from payment states', () => {
    const result = buildReports({ ...input, sales: [{ ...input.sales[0], payment: 'Credit', paymentStatus: 'partially_paid', paidAmount: 500 }] });
    expect(result.receivablesAgeing[0].outstanding).toBe(1760);
    expect(result.payablesAgeing[0].outstanding).toBe(1130);
    expect(reportRows(result, 'vat-register')).toHaveLength(2);
  });
});
