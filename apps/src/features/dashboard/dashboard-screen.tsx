import { useMemo, type ReactNode } from 'react';
import { ImageBackground, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Card, C, Chip, Eyebrow, Screen, SectionHeader, Text, Title } from '@/features/khata/ui';
import { AlertTriangleIcon, ArrowRightIcon, BoxIcon, CheckCircleIcon, CoinsIcon, FileTextIcon, PlusIcon, ReceiptIcon, SparkleIcon, TrendingUpIcon } from '@/features/khata/icons';
import type { Bill, Benefit, Employee, Expense, InventoryItem, Sale } from '@/features/khata/types';

type Props = {
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
  syncLabel?: string;
  onNavigate: (section: string) => void;
};

const money = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;

export function DashboardScreen({ bills, inventory, sales, expenses, employees, benefits, syncLabel = 'Local workspace', onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const month = new Date().toISOString().slice(0, 7);
  const displayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const summary = useMemo(() => {
    const inPeriod = (date: string) => date.startsWith(month);
    const periodBills = bills.filter(item => inPeriod(item.date));
    const periodSales = sales.filter(item => inPeriod(item.date));
    const periodExpenses = expenses.filter(item => inPeriod(item.date));
    const periodBenefits = benefits.filter(item => inPeriod(item.date));
    const revenue = periodSales.reduce((sum, item) => sum + item.total, 0);
    const cost = periodSales.reduce((sum, item) => sum + item.cost, 0);
    const operatingExpenses = periodExpenses.reduce((sum, item) => sum + item.amount, 0) + periodBenefits.reduce((sum, item) => sum + item.amount, 0);
    const purchases = periodBills.reduce((sum, item) => sum + item.total, 0);
    const grossProfit = revenue - cost;
    const profit = grossProfit - operatingExpenses;
    const cashChange = periodSales.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.total, 0)
      - periodBills.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.total, 0)
      - periodExpenses.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.amount, 0)
      - periodBenefits.filter(item => item.payment !== 'Credit').reduce((sum, item) => sum + item.amount, 0);
    const lowStock = inventory.filter(item => item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7);
    const stockValue = inventory.reduce((sum, item) => sum + item.stock * item.purchaseCost, 0);
    const creditSales = periodSales.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.total, 0);
    const creditPurchases = periodBills.filter(item => item.payment === 'Credit').reduce((sum, item) => sum + item.total, 0);
    return { revenue, grossProfit, profit, operatingExpenses, purchases, cashChange, margin: revenue ? (grossProfit / revenue) * 100 : 0, lowStock, stockValue, creditSales, creditPurchases, periodBills, periodSales, periodExpenses };
  }, [benefits, bills, expenses, inventory, month, sales]);

  const metrics = [
    { label: 'Sales this month', value: money(summary.revenue), hint: `${summary.periodSales.length} invoices`, tone: 'blue' as const },
    { label: 'Gross profit', value: money(summary.grossProfit), hint: `${summary.margin.toFixed(1)}% margin`, tone: 'acid' as const },
    { label: 'Cash movement', value: `${summary.cashChange >= 0 ? '+' : '−'} ${money(Math.abs(summary.cashChange))}`, hint: 'Cash and bank entries', tone: 'orange' as const },
    { label: 'Stock value', value: money(summary.stockValue), hint: `${inventory.length} products`, tone: 'bone' as const },
  ];
  const actions = [
    { icon: PlusIcon, label: 'Record a purchase', detail: 'Scan or enter a supplier bill', section: 'purchase-scan' },
    { icon: TrendingUpIcon, label: 'Record a sale', detail: 'Create a simple invoice', section: 'sales-scan' },
    { icon: CoinsIcon, label: 'Add an expense', detail: 'Keep running costs visible', section: 'expenses' },
    { icon: BoxIcon, label: 'Check stock', detail: 'Review reorder pressure', section: 'inventory' },
  ];
  const activity = [
    ...sales.slice(0, 3).map(item => ({ id: item.id, title: item.customer, detail: `${item.date} · Sale`, amount: `+ ${money(item.total)}`, color: C.green })),
    ...bills.slice(0, 3).map(item => ({ id: item.id, title: item.vendor, detail: `${item.date} · Purchase`, amount: `− ${money(item.total)}`, color: C.goldDark })),
    ...expenses.slice(0, 2).map(item => ({ id: item.id, title: item.description, detail: `${item.date} · Expense`, amount: `− ${money(item.amount)}`, color: C.red })),
  ].slice(0, 5);

  return <Screen>
    <View style={[styles.top, compact && styles.topCompact]}><View style={styles.topCopy}><Eyebrow>{displayDate} · Kathmandu</Eyebrow><Title subtitle="The few numbers worth seeing first.">Good morning.</Title></View><Chip tone="green" icon={<CheckCircleIcon size={12} color={C.green} />}>{syncLabel}</Chip></View>

    <ImageBackground source={require('../../../assets/landing/ink-texture-v2.jpg')} resizeMode="cover" imageStyle={styles.signalImage} style={[styles.signalCard, compact && styles.signalCardCompact]}><View style={styles.signalOverlay} /><View style={styles.signalCopy}><Chip tone="gold" icon={<SparkleIcon size={12} color={C.goldDark} />}>This month at a glance</Chip><Text style={[styles.signalTitle, compact && styles.signalTitleCompact]}>The useful picture is already here.</Text><Text style={styles.signalText}>{summary.lowStock.length ? `${summary.lowStock.length} stock item${summary.lowStock.length === 1 ? '' : 's'} need attention. Your margin and cash movement are beside it.` : 'Your stock coverage is steady. Keep sales, cash and profit moving together.'}</Text><View style={styles.signalActions}><Button label="Record entry" icon={<PlusIcon size={16} color={C.white} />} onPress={() => onNavigate('purchase-scan')} /><Button label="Open reports" variant="outline" icon={<ArrowRightIcon size={15} color={C.brick} />} onPress={() => onNavigate('reports')} /></View></View><View style={styles.signalMetric}><Eyebrow>Net cash movement</Eyebrow><Text style={styles.signalMetricValue}>{summary.cashChange >= 0 ? '+' : '−'} {money(Math.abs(summary.cashChange))}</Text><Text style={styles.signalMetricHint}>cash and bank entries</Text></View></ImageBackground>

    <View style={[styles.metrics, compact && styles.metricsCompact]}>{metrics.map(metric => <Metric key={metric.label} {...metric} />)}</View>

    <SectionHeader title="Quick actions" detail="The four things owners do most" />
    <View style={[styles.actions, compact && styles.actionsCompact]}>{actions.map(action => { const Icon = action.icon; return <Pressable key={action.label} onPress={() => onNavigate(action.section)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><View style={styles.actionIcon}><Icon size={19} color={C.blue} /></View><View style={styles.actionCopy}><Text style={styles.actionTitle}>{action.label}</Text><Text style={styles.actionDetail}>{action.detail}</Text></View><ArrowRightIcon size={16} color={C.muted} /></Pressable>; })}</View>

    <SectionHeader title="Needs attention" detail="Small decisions worth making today" />
    <View style={[styles.attentionGrid, compact && styles.attentionGridCompact]}><Attention icon={<AlertTriangleIcon size={18} color={C.orange} />} title={summary.lowStock.length ? `${summary.lowStock.length} low-stock items` : 'Stock looks healthy'} detail={summary.lowStock.length ? summary.lowStock.slice(0, 2).map(item => item.name).join(' · ') : 'No reorder pressure detected.'} onPress={() => onNavigate('inventory')} /><Attention icon={<TrendingUpIcon size={18} color={C.blue} />} title={`${money(summary.creditSales)} receivable`} detail="Credit sales to follow up this month" onPress={() => onNavigate('sales')} /><Attention icon={<ReceiptIcon size={18} color={C.orange} />} title={`${money(summary.creditPurchases)} payable`} detail="Supplier credit in this period" onPress={() => onNavigate('bills')} /></View>

    <SectionHeader title="Recent activity" detail="Latest entries across the workspace" action={<Button label="View all" variant="ghost" icon={<ArrowRightIcon size={14} color={C.brick} />} onPress={() => onNavigate('bills')} />} />
    {activity.length ? activity.map(item => <View key={item.id} style={styles.activity}><View style={styles.activityIcon}><FileTextIcon size={17} color={C.blue} /></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>{item.title}</Text><Eyebrow>{item.detail}</Eyebrow></View><Text style={[styles.activityAmount, { color: item.color }]}>{item.amount}</Text></View>) : <Card style={styles.empty}><Text style={styles.activityTitle}>Your book is ready.</Text><Text style={styles.emptyText}>Record the first sale or purchase to create a useful business picture.</Text><Button label="Record first entry" onPress={() => onNavigate('purchase-scan')} /></Card>}

    <Card style={styles.footerCard}><View style={styles.footerCopy}><Chip tone="gold" icon={<SparkleIcon size={12} color={C.goldDark} />}>A better habit</Chip><Text style={styles.footerTitle}>A few clean entries today can save an entire afternoon later.</Text><Text style={styles.footerDetail}>{employees.filter(item => item.status === 'active').length} active team members · {money(summary.stockValue)} in stock · {money(summary.operatingExpenses)} operating costs</Text></View><Button label="Open reports" variant="outline" onPress={() => onNavigate('reports')} /></Card>
  </Screen>;
}

function Metric({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: 'blue' | 'acid' | 'orange' | 'bone' }) {
  return <View style={[styles.metric, tone === 'blue' && styles.metricBlue, tone === 'acid' && styles.metricAcid, tone === 'orange' && styles.metricOrange, tone === 'bone' && styles.metricBone]}><Text style={[styles.metricLabel, tone === 'acid' && styles.darkText, tone === 'bone' && styles.darkText]}>{label}</Text><Text style={[styles.metricValue, tone === 'acid' && styles.darkText, tone === 'bone' && styles.darkText]}>{value}</Text><Text style={[styles.metricHint, tone === 'acid' && styles.darkText, tone === 'bone' && styles.darkText]}>{hint}</Text></View>;
}

function Attention({ icon, title, detail, onPress }: { icon: ReactNode; title: string; detail: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.attention, pressed && styles.pressed]}><View style={styles.attentionIcon}>{icon}</View><View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{title}</Text><Text style={styles.attentionDetail}>{detail}</Text></View><ArrowRightIcon size={15} color={C.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  topCompact: { flexDirection: 'column', gap: 8 },
  topCopy: { flex: 1, minWidth: 0 },
  signalCard: { minHeight: 250, flexDirection: 'row', alignItems: 'stretch', gap: 18, overflow: 'hidden', padding: 22, backgroundColor: '#10182D', borderColor: '#263B7A', borderWidth: 1 },
  signalCardCompact: { flexDirection: 'column', padding: 17, gap: 24 },
  signalImage: { opacity: 0.36 },
  signalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,20,0.43)' },
  signalCopy: { flex: 1, gap: 10, zIndex: 1 },
  signalTitle: { color: C.white, fontSize: 31, lineHeight: 34, fontWeight: '900', letterSpacing: -1, maxWidth: 520 },
  signalTitleCompact: { fontSize: 25, lineHeight: 29 },
  signalText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 20, maxWidth: 540 },
  signalActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  signalMetric: { minWidth: 174, alignSelf: 'flex-end', justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(200,255,61,0.94)', zIndex: 1 },
  signalMetricValue: { color: C.ink, fontSize: 26, lineHeight: 30, fontWeight: '900', marginTop: 5 },
  signalMetricHint: { color: 'rgba(8,11,20,0.65)', fontSize: 11, marginTop: 5 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  metricsCompact: { gap: 7 },
  metric: { flex: 1, minWidth: 150, minHeight: 118, padding: 15, justifyContent: 'space-between' },
  metricBlue: { backgroundColor: C.blue },
  metricAcid: { backgroundColor: '#C8FF3D' },
  metricOrange: { backgroundColor: C.orange },
  metricBone: { backgroundColor: C.bone },
  metricLabel: { color: 'rgba(255,255,255,0.76)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  metricValue: { color: C.white, fontSize: 22, lineHeight: 25, fontWeight: '900', letterSpacing: -0.7 },
  metricHint: { color: 'rgba(255,255,255,0.66)', fontSize: 10 },
  darkText: { color: C.ink },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  actionsCompact: { flexDirection: 'column', gap: 7 },
  action: { flexGrow: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1 },
  actionIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7ECFF' },
  actionCopy: { flex: 1, gap: 3 },
  actionTitle: { color: C.ink, fontWeight: '900', fontSize: 13 },
  actionDetail: { color: C.muted, fontSize: 11 },
  attentionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  attentionGridCompact: { flexDirection: 'column', gap: 7 },
  attention: { flex: 1, minWidth: 220, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1 },
  attentionIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0E8' },
  attentionCopy: { flex: 1, gap: 3 },
  attentionTitle: { color: C.ink, fontSize: 13, fontWeight: '900' },
  attentionDetail: { color: C.muted, fontSize: 11, lineHeight: 16 },
  activity: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginBottom: 7, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1 },
  activityIcon: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7ECFF' },
  activityCopy: { flex: 1, gap: 3 },
  activityTitle: { color: C.ink, fontSize: 14, fontWeight: '900' },
  activityAmount: { fontSize: 13, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: C.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 340 },
  footerCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, backgroundColor: C.yellowLight, borderColor: '#E4C077' },
  footerCopy: { flex: 1, minWidth: 220, gap: 5 },
  footerTitle: { color: C.ink, fontSize: 17, lineHeight: 22, fontWeight: '900' },
  footerDetail: { color: C.muted, fontSize: 11, lineHeight: 17 },
  pressed: { opacity: 0.75 },
});

export default DashboardScreen;
