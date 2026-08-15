import type { Bill, InventoryItem, Sale } from '@/features/khata/types';

export type Insight = {
  id: string;
  title: string;
  detail: string;
  section: 'inventory' | 'receivables' | 'reports' | 'sales';
  tone: 'red' | 'gold' | 'green';
  priority: number;
  amount?: number;
};

const outstanding = (total: number, paid: number | undefined, payment: string, status: Sale['paymentStatus'] | Bill['paymentStatus']) => (status || (payment === 'Credit' ? 'pending' : 'paid')) === 'paid' ? 0 : Math.max(0, total - (paid || 0));

export function buildInsights({ bills, inventory, sales }: { bills: Bill[]; inventory: InventoryItem[]; sales: Sale[] }): Insight[] {
  const insights: Insight[] = [];
  const lowStock = inventory.filter(item => item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7);
  const receivable = sales.reduce((sum, sale) => sum + outstanding(sale.total, sale.paidAmount, sale.payment, sale.paymentStatus), 0);
  const payable = bills.reduce((sum, bill) => sum + outstanding(bill.total, bill.paidAmount, bill.payment, bill.paymentStatus), 0);
  if (lowStock.length)
    insights.push({ id: 'low-stock', title: `${lowStock.length} product${lowStock.length === 1 ? '' : 's'} need replenishing`, detail: lowStock.slice(0, 3).map(item => item.name).join(' · '), section: 'inventory', tone: 'red', priority: 100 });
  if (receivable > 0)
    insights.push({ id: 'receivables', title: 'Follow up on customer balances', detail: 'Open the receivables list and confirm collections as money arrives.', section: 'receivables', tone: 'gold', priority: 90, amount: receivable });
  if (payable > 0)
    insights.push({ id: 'payables', title: 'Supplier bills are still open', detail: 'Review payables before the next restock or bank run.', section: 'receivables', tone: 'gold', priority: 80, amount: payable });
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const grossProfit = revenue - sales.reduce((sum, sale) => sum + sale.cost, 0);
  if (revenue > 0 && grossProfit / revenue < 0.15)
    insights.push({ id: 'margin', title: 'Gross margin is under pressure', detail: 'Review selling prices and purchase costs before the next price list update.', section: 'reports', tone: 'red', priority: 70, amount: grossProfit / revenue * 100 });
  if (!insights.length)
    insights.push({ id: 'steady', title: 'Your workspace is up to date', detail: 'Keep recording each sale, purchase and payment to keep insights useful.', section: 'reports', tone: 'green', priority: 10 });
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4);
}
