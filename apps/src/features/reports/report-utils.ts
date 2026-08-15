import type { Bill, Benefit, Expense, InventoryItem, Sale } from '@/features/khata/types';

export type ReportPeriod = 'all' | string;

export type ReportInputs = {
  bills: Bill[];
  sales: Sale[];
  expenses: Expense[];
  benefits: Benefit[];
  inventory: InventoryItem[];
  vatRate?: number;
};

export type DayBookRow = {
  id: string;
  date: string;
  description: string;
  reference: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
};

export type TrialBalanceLine = { account: string; debit: number; credit: number };
export type StockReportLine = { id: string; name: string; category: string; unit: string; quantity: number; value: number; sellingValue: number; margin: number; low: boolean };
export type AgeingLine = { id: string; party: string; date: string; reference: string; total: number; paid: number; outstanding: number; bucket: '0-30 days' | '31-60 days' | '61-90 days' | '90+ days' };
export type VatRegisterLine = { id: string; kind: 'Sale' | 'Purchase'; date: string; party: string; reference: string; taxable: number; vat: number; gross: number };

export type ReportBundle = {
  period: ReportPeriod;
  periodLabel: string;
  dayBook: DayBookRow[];
  trialBalance: { lines: TrialBalanceLine[]; totalDebit: number; totalCredit: number };
  profitLoss: { revenue: number; costOfGoodsSold: number; grossProfit: number; expenses: number; benefits: number; netProfit: number; margin: number };
  balanceSheet: { assets: Array<{ label: string; amount: number }>; liabilities: Array<{ label: string; amount: number }>; equity: number; totalAssets: number; totalLiabilitiesAndEquity: number };
  vatSummary: { rate: number; salesGross: number; outputVat: number; purchaseGross: number; inputVat: number; netVat: number };
  stockReport: StockReportLine[];
  receivablesAgeing: AgeingLine[];
  payablesAgeing: AgeingLine[];
  vatRegister: VatRegisterLine[];
};

const paymentAccount = (payment: string) => payment === 'Credit' ? 'Accounts payable / receivable' : payment === 'Bank transfer' || payment === 'Online payment' ? 'Bank' : 'Cash';
const inPeriod = (date: string, period: ReportPeriod) => period === 'all' || date.startsWith(period);
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const paymentStatus = (payment: string, status: Sale['paymentStatus'] | Bill['paymentStatus']) => status || (payment === 'Credit' ? 'pending' : 'paid');
const outstandingAmount = (total: number, paid: number | undefined, payment: string, status: Sale['paymentStatus'] | Bill['paymentStatus']) => paymentStatus(payment, status) === 'paid' ? 0 : Math.max(0, total - (paid || 0));
function ageingBucket(date: string): AgeingLine['bucket'] {
  const days = Math.max(0, Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000));
  return days <= 30 ? '0-30 days' : days <= 60 ? '31-60 days' : days <= 90 ? '61-90 days' : '90+ days';
}

export function buildReports(input: ReportInputs, period: ReportPeriod = 'all'): ReportBundle {
  const bills = input.bills.filter(item => inPeriod(item.date, period));
  const sales = input.sales.filter(item => inPeriod(item.date, period));
  const expenses = input.expenses.filter(item => inPeriod(item.date, period));
  const benefits = input.benefits.filter(item => inPeriod(item.date, period));
  const rate = input.vatRate && input.vatRate > 0 ? input.vatRate : 13;
  const dayBook: DayBookRow[] = [];
  const ledger = new Map<string, { debit: number; credit: number }>();
  const post = (account: string, side: 'debit' | 'credit', amount: number) => {
    const current = ledger.get(account) || { debit: 0, credit: 0 };
    current[side] += amount;
    ledger.set(account, current);
  };
  const addEntry = (entry: DayBookRow) => {
    dayBook.push(entry);
    post(entry.debitAccount, 'debit', entry.amount);
    post(entry.creditAccount, 'credit', entry.amount);
  };

  sales.forEach(sale => {
    const cashAccount = sale.payment === 'Credit' ? 'Accounts receivable' : paymentAccount(sale.payment);
    addEntry({ id: `${sale.id}-sale`, date: sale.date, description: `Sale · ${sale.customer}`, reference: sale.id, debitAccount: cashAccount, creditAccount: 'Sales revenue', amount: sale.total });
    if (sale.cost > 0) addEntry({ id: `${sale.id}-cost`, date: sale.date, description: `Cost of sale · ${sale.customer}`, reference: sale.id, debitAccount: 'Cost of goods sold', creditAccount: 'Inventory', amount: sale.cost });
  });
  bills.forEach(bill => {
    const net = Math.max(0, bill.total - bill.vat);
    const creditAccount = bill.payment === 'Credit' ? 'Accounts payable' : paymentAccount(bill.payment);
    addEntry({ id: `${bill.id}-purchase`, date: bill.date, description: `Purchase · ${bill.vendor}`, reference: bill.invoice || bill.id, debitAccount: 'Inventory', creditAccount, amount: net });
    if (bill.vat > 0) addEntry({ id: `${bill.id}-vat`, date: bill.date, description: `Input VAT · ${bill.vendor}`, reference: bill.invoice || bill.id, debitAccount: 'Input VAT', creditAccount, amount: bill.vat });
  });
  expenses.forEach(expense => addEntry({ id: expense.id, date: expense.date, description: `Expense · ${expense.description}`, reference: expense.id, debitAccount: `Expense · ${expense.category}`, creditAccount: expense.payment === 'Credit' ? 'Accounts payable' : paymentAccount(expense.payment), amount: expense.amount }));
  benefits.forEach(benefit => addEntry({ id: benefit.id, date: benefit.date, description: `Benefit · ${benefit.type}`, reference: benefit.id, debitAccount: 'Employee benefits', creditAccount: benefit.payment === 'Credit' ? 'Accounts payable' : paymentAccount(benefit.payment), amount: benefit.amount }));
  dayBook.sort((a, b) => b.date.localeCompare(a.date));

  const trialLines = Array.from(ledger.entries()).map(([account, value]) => ({ account, debit: round(value.debit), credit: round(value.credit) })).filter(line => line.debit || line.credit).sort((a, b) => a.account.localeCompare(b.account));
  const totalDebit = round(trialLines.reduce((sum, line) => sum + line.debit, 0));
  const totalCredit = round(trialLines.reduce((sum, line) => sum + line.credit, 0));
  if (totalDebit !== totalCredit) {
    const difference = round(totalDebit - totalCredit);
    trialLines.push(difference > 0 ? { account: 'Opening / retained equity', debit: 0, credit: difference } : { account: 'Opening / retained equity', debit: Math.abs(difference), credit: 0 });
  }
  const balancedDebit = round(trialLines.reduce((sum, line) => sum + line.debit, 0));
  const balancedCredit = round(trialLines.reduce((sum, line) => sum + line.credit, 0));

  const revenue = round(sales.reduce((sum, item) => sum + item.total, 0));
  const costOfGoodsSold = round(sales.reduce((sum, item) => sum + item.cost, 0));
  const expensesTotal = round(expenses.reduce((sum, item) => sum + item.amount, 0));
  const benefitsTotal = round(benefits.reduce((sum, item) => sum + item.amount, 0));
  const grossProfit = round(revenue - costOfGoodsSold);
  const netProfit = round(grossProfit - expensesTotal - benefitsTotal);
  const stockReport = input.inventory.map(item => ({ id: item.id, name: item.name, category: item.category, unit: item.unit, quantity: item.stock, value: round(item.stock * item.purchaseCost), sellingValue: round(item.stock * item.sellingPrice), margin: round(item.stock * Math.max(0, item.sellingPrice - item.purchaseCost)), low: item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7 })).sort((a, b) => Number(b.low) - Number(a.low) || a.name.localeCompare(b.name));

  const cash = sales.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.total, 0) - bills.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.total, 0) - expenses.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.amount, 0) - benefits.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.amount, 0);
  const receivables = sales.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.total, 0);
  const inventoryValue = stockReport.reduce((sum, item) => sum + item.value, 0);
  const inputVat = bills.reduce((sum, item) => sum + item.vat, 0);
  const outputVat = sales.reduce((sum, item) => sum + item.total - (item.total / (100 + rate) * 100), 0);
  const payables = bills.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.total, 0) + expenses.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.amount, 0) + benefits.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.amount, 0);
  const assets = [{ label: 'Cash and bank', amount: round(cash) }, { label: 'Accounts receivable', amount: round(receivables) }, { label: 'Inventory at cost', amount: round(inventoryValue) }, { label: 'Input VAT', amount: round(inputVat) }];
  const liabilities = [{ label: 'Accounts payable', amount: round(payables) }];
  const totalAssets = round(assets.reduce((sum, item) => sum + item.amount, 0));
  const totalLiabilities = round(liabilities.reduce((sum, item) => sum + item.amount, 0));
  const equity = round(totalAssets - totalLiabilities);
  const receivablesAgeing = sales.map(item => ({ id: item.id, party: item.customer, date: item.date, reference: item.id, total: round(item.total), paid: round(item.paidAmount || 0), outstanding: round(outstandingAmount(item.total, item.paidAmount, item.payment, item.paymentStatus)), bucket: ageingBucket(item.date) })).filter(item => item.outstanding > 0);
  const payablesAgeing = bills.map(item => ({ id: item.id, party: item.vendor, date: item.date, reference: item.invoice || item.id, total: round(item.total), paid: round(item.paidAmount || 0), outstanding: round(outstandingAmount(item.total, item.paidAmount, item.payment, item.paymentStatus)), bucket: ageingBucket(item.date) })).filter(item => item.outstanding > 0);
  const vatRegister: VatRegisterLine[] = [
    ...sales.map(item => ({ id: `${item.id}-output`, kind: 'Sale' as const, date: item.date, party: item.customer, reference: item.id, taxable: round(item.total / (100 + rate) * 100), vat: round(item.total - (item.total / (100 + rate) * 100)), gross: round(item.total) })),
    ...bills.map(item => ({ id: `${item.id}-input`, kind: 'Purchase' as const, date: item.date, party: item.vendor, reference: item.invoice || item.id, taxable: round(Math.max(0, item.total - item.vat)), vat: round(item.vat), gross: round(item.total) })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return { period, periodLabel: period === 'all' ? 'All recorded entries' : period, dayBook, trialBalance: { lines: trialLines, totalDebit: balancedDebit, totalCredit: balancedCredit }, profitLoss: { revenue, costOfGoodsSold, grossProfit, expenses: expensesTotal, benefits: benefitsTotal, netProfit, margin: revenue ? round((grossProfit / revenue) * 100) : 0 }, balanceSheet: { assets, liabilities, equity, totalAssets, totalLiabilitiesAndEquity: round(totalLiabilities + equity) }, vatSummary: { rate, salesGross: revenue, outputVat: round(outputVat), purchaseGross: round(bills.reduce((sum, item) => sum + item.total, 0)), inputVat: round(inputVat), netVat: round(outputVat - inputVat) }, stockReport, receivablesAgeing, payablesAgeing, vatRegister };
}

export function reportRows(bundle: ReportBundle, kind: string): Array<Record<string, string | number>> {
  if (kind === 'day-book') return bundle.dayBook.map(row => ({ Date: row.date, Description: row.description, Reference: row.reference, Debit: row.debitAccount, Credit: row.creditAccount, Amount: row.amount }));
  if (kind === 'trial-balance') return bundle.trialBalance.lines.map(row => ({ Account: row.account, Debit: row.debit, Credit: row.credit }));
  if (kind === 'profit-loss') return [{ Line: 'Sales revenue', Amount: bundle.profitLoss.revenue }, { Line: 'Cost of goods sold', Amount: bundle.profitLoss.costOfGoodsSold }, { Line: 'Gross profit', Amount: bundle.profitLoss.grossProfit }, { Line: 'Operating expenses', Amount: bundle.profitLoss.expenses }, { Line: 'Employee benefits', Amount: bundle.profitLoss.benefits }, { Line: 'Net profit', Amount: bundle.profitLoss.netProfit }];
  if (kind === 'balance-sheet') return [...bundle.balanceSheet.assets.map(row => ({ Section: 'Assets', Line: row.label, Amount: row.amount })), ...bundle.balanceSheet.liabilities.map(row => ({ Section: 'Liabilities', Line: row.label, Amount: row.amount })), { Section: 'Equity', Line: 'Equity / retained earnings', Amount: bundle.balanceSheet.equity }];
  if (kind === 'vat-summary') return [{ Line: 'Sales gross', Amount: bundle.vatSummary.salesGross }, { Line: 'Output VAT', Amount: bundle.vatSummary.outputVat }, { Line: 'Purchases gross', Amount: bundle.vatSummary.purchaseGross }, { Line: 'Input VAT', Amount: bundle.vatSummary.inputVat }, { Line: 'Net VAT payable / credit', Amount: bundle.vatSummary.netVat }];
  if (kind === 'receivables-ageing') return bundle.receivablesAgeing.map(row => ({ Party: row.party, Date: row.date, Reference: row.reference, Bucket: row.bucket, Total: row.total, Paid: row.paid, Outstanding: row.outstanding }));
  if (kind === 'payables-ageing') return bundle.payablesAgeing.map(row => ({ Party: row.party, Date: row.date, Reference: row.reference, Bucket: row.bucket, Total: row.total, Paid: row.paid, Outstanding: row.outstanding }));
  if (kind === 'vat-register') return bundle.vatRegister.map(row => ({ Type: row.kind, Date: row.date, Party: row.party, Reference: row.reference, Taxable: row.taxable, VAT: row.vat, Gross: row.gross }));
  return bundle.stockReport.map(row => ({ Product: row.name, Category: row.category, Quantity: row.quantity, Unit: row.unit, 'Stock value': row.value, 'Selling value': row.sellingValue, Margin: row.margin, Status: row.low ? 'Low stock' : 'Healthy' }));
}

export function rowsToCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return 'No data\n';
  const columns = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [columns.map(escape).join(','), ...rows.map(row => columns.map(column => escape(row[column] ?? '')).join(','))].join('\n');
}
