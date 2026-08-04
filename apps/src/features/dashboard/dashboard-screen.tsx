import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, C, Chip, Eyebrow, Screen, SERIF, SectionHeader, Stat, Text, Title } from '@/features/khata/ui';
import { ArrowRightIcon, BoxIcon, CheckCircleIcon, CoinsIcon, PlusIcon, ReceiptIcon, SparkleIcon } from '@/features/khata/icons';
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
    { icon: PlusIcon, label: 'Record purchase', section: 'purchase-scan' },
    { icon: ReceiptIcon, label: 'Create sales invoice', section: 'sales-scan' },
    { icon: CoinsIcon, label: 'Add expense', section: 'expenses' },
    { icon: BoxIcon, label: 'Open inventory', section: 'inventory' },
  ];

  const stats = [
    { label: 'Today’s sales', value: `NPR ${summary.revenue.toLocaleString()}`, tone: 'green' as const },
    { label: 'Today’s purchases', value: `NPR ${summary.purchases.toLocaleString()}`, tone: 'gold' as const },
    { label: 'Today’s expenses', value: `NPR ${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`, tone: 'red' as const },
    { label: 'Today’s profit', value: `NPR ${summary.profit.toLocaleString()}`, tone: 'brick' as const },
  ];

  const transactions = [
    ...sales.slice(0, 2).map(sale => ({ title: sale.customer, detail: `${sale.date} · Sales invoice`, amount: `+ NPR ${sale.total.toLocaleString()}`, tone: C.green })),
    ...bills.slice(0, 2).map(bill => ({ title: bill.vendor, detail: `${bill.date} · Purchase bill`, amount: `− NPR ${bill.total.toLocaleString()}`, tone: C.gold })),
    ...expenses.slice(0, 1).map(expense => ({ title: expense.description, detail: `${expense.date} · Expense`, amount: `− NPR ${expense.amount.toLocaleString()}`, tone: C.red })),
  ];

  return <Screen>
    <View style={styles.top}><View><Eyebrow>Sunday, 2 August 2026 · Kathmandu</Eyebrow><Title subtitle="Business overview">Namaste, Khata</Title></View><Chip tone="green" icon={<CheckCircleIcon size={12} color={C.green} />}>Synced locally</Chip></View>
    <View style={styles.hero}><View style={styles.heroCopy}><Chip tone="gold" icon={<SparkleIcon size={12} color={C.goldDark} />}>Business overview</Chip><Text style={styles.heroTitle}>Your business at a glance, with the important numbers first.</Text><Text style={styles.heroText}>Track sales, purchases, inventory value, profit, and cash pressure from one clean dashboard.</Text><View style={styles.heroButtons}><Button label="Quick create" icon={<PlusIcon size={16} color={C.white} />} onPress={() => onNavigate('purchase-scan')} /><Button label="Download report" variant="outline" icon={<ArrowRightIcon size={16} color={C.ink} />} onPress={() => onNavigate('reports')} /></View></View><View style={styles.health}><Eyebrow>Business health</Eyebrow><Text style={styles.healthValue}>{Math.max(32, Math.min(96, Math.round(62 + summary.margin * 0.5 - summary.lowStock * 3)))}%</Text><View style={styles.progress}><View style={[styles.progressFill, { width: `${Math.max(8, Math.min(100, 62 + summary.margin * 0.5))}%` }]} /></View><Eyebrow>Healthy profit margin and inventory coverage.</Eyebrow></View></View>
    <View style={styles.stats}>{stats.map(stat => <Stat key={stat.label} label={stat.label} value={stat.value} hint="Current period summary" tone={stat.tone} />)}</View>
    <SectionHeader title="Quick actions" detail="Frequently used shortcuts" />
    <View style={styles.actions}>{actions.map(action => <Pressable key={action.label} onPress={() => onNavigate(action.section)} style={({ pressed }) => [styles.action, pressed && { opacity: 0.75 }]}><View style={styles.actionIcon}><action.icon size={19} color={C.brick} /></View><Text style={styles.actionText}>{action.label}</Text><ArrowRightIcon size={16} color={C.muted} /></Pressable>)}</View>
    <SectionHeader title="Recent transactions" detail="Latest entries across your workspace" action={<Button label="View all" variant="ghost" icon={<ArrowRightIcon size={14} color={C.brick} />} onPress={() => onNavigate('bills')} />} />
    {transactions.map((item, index) => <View key={`${item.title}-${index}`} style={styles.transaction}><View style={styles.transactionIcon}><ReceiptIcon size={18} color={C.brick} /></View><View style={{ flex: 1 }}><Text style={styles.transactionTitle}>{item.title}</Text><Eyebrow>{item.detail}</Eyebrow></View><Text style={[styles.amount, { color: item.tone }]}>{item.amount}</Text></View>)}
    <Card style={styles.insight}><View style={{ flex: 1, gap: 5 }}><Chip tone="gold" icon={<SparkleIcon size={12} color={C.goldDark} />}>Khata insight</Chip><Text style={styles.insightTitle}>{summary.lowStock > 0 ? `${summary.lowStock} items need a reorder decision this week.` : 'Your inventory coverage is in a healthy range.'}</Text><Eyebrow>Business health combines margin, inventory coverage, and pending work.</Eyebrow></View><Button label="Open inventory" variant="outline" icon={<BoxIcon size={16} color={C.ink} />} onPress={() => onNavigate('inventory')} /></Card>
    <Eyebrow>{employees.length} active employees · NPR {summary.stockValue.toLocaleString()} inventory value · {summary.margin.toFixed(1)}% net margin</Eyebrow>
  </Screen>;
}

const styles = StyleSheet.create({   top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }, hero: { backgroundColor: C.brickDark, borderRadius: 18, padding: 22, flexDirection: 'row', gap: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexWrap: 'wrap' }, heroCopy: { flex: 1, gap: 10, minWidth: 240 }, heroTitle: { color: C.white, fontSize: 27, lineHeight: 33, fontWeight: '800', marginTop: 5, fontFamily: SERIF, letterSpacing: -0.3 }, heroText: { color: 'rgba(255,255,255,.78)', fontSize: 13, lineHeight: 20 }, heroButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }, health: { backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 12, padding: 16, minWidth: 220, justifyContent: 'center', gap: 5, flexGrow: 1 }, healthValue: { color: C.ink, fontSize: 31, fontWeight: '800', marginVertical: 3, fontFamily: SERIF, letterSpacing: -0.5 }, progress: { height: 8, backgroundColor: C.border, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }, progressFill: { height: 8, backgroundColor: C.gold, borderRadius: 8 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, action: { flexGrow: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(253,248,238,0.85)', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.border }, actionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' }, actionText: { color: C.ink, fontWeight: '700', flex: 1 }, transaction: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(253,248,238,0.85)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 8 }, transactionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1E7D8', alignItems: 'center', justifyContent: 'center' }, transactionTitle: { color: C.ink, fontWeight: '700', marginBottom: 4 }, amount: { fontWeight: '800' }, insight: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FDF7E6', borderColor: '#E0C88F' }, insightTitle: { color: C.ink, fontSize: 16, fontWeight: '800', fontFamily: SERIF },
});

export default DashboardScreen;
