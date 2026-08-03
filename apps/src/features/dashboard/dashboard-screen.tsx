import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, C, Chip, Eyebrow, Screen, SectionHeader, Stat, Text, Title } from '@/features/khata/ui';
import type { Bill, Benefit, Employee, Expense, InventoryItem, Sale } from '@/features/khata/types';

type Props = {
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
  onNavigate: (section: string) => void;
};

export function DashboardScreen({ bills, inventory, sales, expenses, employees, benefits, onNavigate }: Props) {
  const summary = useMemo(() => {
    const purchases = bills.reduce((total, bill) => total + bill.total, 0);
    const revenue = sales.reduce((total, sale) => total + sale.total, 0);
    const cogs = sales.reduce((total, sale) => total + sale.cost, 0);
    const operatingExpenses = expenses.reduce((total, expense) => total + expense.amount, 0) + benefits.reduce((total, benefit) => total + benefit.amount, 0);
    const profit = revenue - cogs - operatingExpenses;
    const stockValue = inventory.reduce((total, item) => total + item.stock * item.purchaseCost, 0);
    const lowStock = inventory.filter(item => item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7).length;
    return { purchases, revenue, profit, stockValue, lowStock, margin: revenue ? (profit / revenue) * 100 : 0 };
  }, [bills, inventory, sales, expenses, benefits]);

  const actions = [
    ['＋', 'Record purchase', 'purchase-scan'], ['＋', 'Create sales invoice', 'sales-scan'], ['＋', 'Add expense', 'expenses'], ['→', 'Open inventory', 'inventory'],
  ];

  return <Screen>
    <View style={styles.top}><View><Eyebrow>Sunday, 2 August 2026 · Kathmandu</Eyebrow><Title subtitle="Business overview">Namaste, Khata 👋</Title></View><Chip tone="green">● Synced locally</Chip></View>
    <View style={styles.hero}><View style={styles.heroCopy}><Chip>✦ Business overview</Chip><Text style={styles.heroTitle}>Your business at a glance, with the important numbers first.</Text><Text style={styles.heroText}>Track sales, purchases, inventory value, profit, and cash pressure from one clean dashboard.</Text><View style={styles.heroButtons}><Button label="＋ Quick create" onPress={() => onNavigate('purchase-scan')} /><Button label="Download report →" variant="outline" onPress={() => onNavigate('reports')} /></View></View><View style={styles.health}><Eyebrow>Business health</Eyebrow><Text style={styles.healthValue}>{Math.max(32, Math.min(96, Math.round(62 + summary.margin * 0.5 - summary.lowStock * 3)))}%</Text><View style={styles.progress}><View style={[styles.progressFill, { width: `${Math.max(8, Math.min(100, 62 + summary.margin * 0.5))}%` }]} /></View><Eyebrow>Healthy profit margin and inventory coverage.</Eyebrow></View></View>
    <View style={styles.stats}>{[
      ['Today’s sales', `NPR ${summary.revenue.toLocaleString()}`, 'green'], ['Today’s purchases', `NPR ${summary.purchases.toLocaleString()}`, 'gold'], ['Today’s expenses', `NPR ${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`, 'red'], ['Today’s profit', `NPR ${summary.profit.toLocaleString()}`, 'brick'],
    ].map(([label, value, tone]) => <Stat key={label} label={label} value={value} hint="Current period summary" tone={tone as 'green' | 'gold' | 'red' | 'brick'} />)}</View>
    <SectionHeader title="Quick actions" detail="Frequently used shortcuts" />
    <View style={styles.actions}>{actions.map(([icon, label, section]) => <Pressable key={label} onPress={() => onNavigate(section)} style={({ pressed }) => [styles.action, pressed && { opacity: 0.75 }]}><View style={styles.actionIcon}><Text style={styles.actionIconText}>{icon}</Text></View><Text style={styles.actionText}>{label}</Text><Text style={styles.arrow}>→</Text></Pressable>)}</View>
    <SectionHeader title="Recent transactions" detail="Latest entries across your workspace" action={<Button label="View all →" variant="ghost" onPress={() => onNavigate('bills')} />} />
    {[...sales.slice(0, 2).map(sale => ({ title: sale.customer, detail: `${sale.date} · Sales invoice`, amount: `+ NPR ${sale.total.toLocaleString()}`, tone: C.green })), ...bills.slice(0, 2).map(bill => ({ title: bill.vendor, detail: `${bill.date} · Purchase bill`, amount: `− NPR ${bill.total.toLocaleString()}`, tone: C.gold })), ...expenses.slice(0, 1).map(expense => ({ title: expense.description, detail: `${expense.date} · Expense`, amount: `− NPR ${expense.amount.toLocaleString()}`, tone: C.red }))].map((item, index) => <View key={`${item.title}-${index}`} style={styles.transaction}><View style={styles.transactionIcon}><Text>▣</Text></View><View style={{ flex: 1 }}><Text style={styles.transactionTitle}>{item.title}</Text><Eyebrow>{item.detail}</Eyebrow></View><Text style={[styles.amount, { color: item.tone }]}>{item.amount}</Text></View>)}
    <Card style={styles.insight}><View style={{ flex: 1, gap: 5 }}><Chip tone="gold">✦ Khata insight</Chip><Text style={styles.insightTitle}>{summary.lowStock > 0 ? `${summary.lowStock} items need a reorder decision this week.` : 'Your inventory coverage is in a healthy range.'}</Text><Eyebrow>Business health combines margin, inventory coverage, and pending work.</Eyebrow></View><Button label="Open inventory" variant="outline" onPress={() => onNavigate('inventory')} /></Card>
    <Eyebrow>{employees.length} active employees · NPR {summary.stockValue.toLocaleString()} inventory value · {summary.margin.toFixed(1)}% net margin</Eyebrow>
  </Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, hero: { backgroundColor: C.brickDark, borderRadius: 22, padding: 22, flexDirection: 'row', gap: 18, overflow: 'hidden' }, heroCopy: { flex: 1, gap: 10 }, heroTitle: { color: C.white, fontSize: 27, lineHeight: 33, fontWeight: '800', marginTop: 5 }, heroText: { color: 'rgba(255,255,255,.78)', fontSize: 13, lineHeight: 20 }, heroButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }, health: { backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 16, padding: 16, width: 220, justifyContent: 'center', gap: 5 }, healthValue: { color: C.ink, fontSize: 31, fontWeight: '800', marginVertical: 3 }, progress: { height: 8, backgroundColor: C.border, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }, progressFill: { height: 8, backgroundColor: C.gold, borderRadius: 8 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, action: { flexGrow: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: C.border }, actionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' }, actionIconText: { color: C.brick, fontSize: 20 }, actionText: { color: C.ink, fontWeight: '700', flex: 1 }, arrow: { color: C.muted, fontSize: 18 }, transaction: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,.82)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 8 }, transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1E7D8', alignItems: 'center', justifyContent: 'center' }, transactionTitle: { color: C.ink, fontWeight: '700', marginBottom: 4 }, amount: { fontWeight: '800' }, insight: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF8E8', borderColor: '#E4C077' }, insightTitle: { color: C.ink, fontSize: 16, fontWeight: '800' },
});

export default DashboardScreen;
