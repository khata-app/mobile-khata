import type { Benefit, Bill, Employee, Expense, InventoryItem, Sale } from '@/features/khata/types';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AlertTriangleIcon, ArrowRightIcon, BarChartIcon, BoxIcon, BuyIcon, CameraIcon, CoinsIcon, FileTextIcon, GearIcon, ReceiptIcon, SellIcon, UsersIcon, WalletIcon } from '@/features/khata/icons';
import { C, Card, Eyebrow, Screen, SectionHeader, SERIF, Text, Title } from '@/features/khata/ui';
import { buildInsights } from '@/features/insights/insight-utils';

type Props = {
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
  onNavigate: (section: string) => void;
};

const money = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;

export function DashboardScreen({ bills, inventory, sales, expenses, employees, benefits, onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const month = new Date().toISOString().slice(0, 7);
  const displayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const summary = useMemo(() => {
    const inMonth = (date: string) => date.startsWith(month);
    const monthSales = sales.filter(item => inMonth(item.date));
    const monthBills = bills.filter(item => inMonth(item.date));
    const monthExpenses = expenses.filter(item => inMonth(item.date));
    const monthBenefits = benefits.filter(item => inMonth(item.date));
    const revenue = monthSales.reduce((sum, item) => sum + item.total, 0);
    const cost = monthSales.reduce((sum, item) => sum + item.cost, 0);
    const expensesTotal = monthExpenses.reduce((sum, item) => sum + item.amount, 0) + monthBenefits.reduce((sum, item) => sum + item.amount, 0);
    const purchases = monthBills.reduce((sum, item) => sum + item.total, 0);
    const lowStock = inventory.filter(item => item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7);
    return { revenue, profit: revenue - cost - expensesTotal, purchases, expensesTotal, lowStock, monthSales, monthBills };
  }, [benefits, bills, expenses, inventory, month, sales]);
  const insights = useMemo(() => buildInsights({ bills, inventory, sales }), [bills, inventory, sales]);

  const destinations = [
    { section: 'purchase-scan', label: 'Buy', detail: 'Add a supplier bill', icon: BuyIcon, tone: 'brick' as const },
    { section: 'sales-scan', label: 'Sell', detail: 'Record a customer sale', icon: SellIcon, tone: 'green' as const },
    { section: 'bills', label: 'Bills', detail: `${bills.length} saved`, icon: ReceiptIcon },
    { section: 'inventory', label: 'Stock', detail: summary.lowStock.length ? `${summary.lowStock.length} running low` : `${inventory.length} products`, icon: BoxIcon },
    { section: 'sales', label: 'Sales', detail: `${sales.length} entries`, icon: BarChartIcon },
    { section: 'receivables', label: 'Balances', detail: 'Receivables and payables', icon: WalletIcon },
    { section: 'expenses', label: 'Expenses', detail: 'Running costs', icon: CoinsIcon },
    { section: 'employees', label: 'Team', detail: `${employees.filter(item => item.status === 'active').length} people`, icon: UsersIcon },
    { section: 'reports', label: 'Reports', detail: 'Profit, tax and stock', icon: FileTextIcon },
    { section: 'settings', label: 'Settings', detail: 'Business and sync', icon: GearIcon },
  ];

  const activity = [
    ...sales.slice(0, 3).map(item => ({ id: item.id, title: item.customer, detail: `Sale · ${item.date}`, amount: `+ ${money(item.total)}`, color: C.greenDark })),
    ...bills.slice(0, 2).map(item => ({ id: item.id, title: item.vendor, detail: `Purchase · ${item.date}`, amount: `− ${money(item.total)}`, color: C.brick })),
    ...expenses.slice(0, 2).map(item => ({ id: item.id, title: item.description, detail: `Expense · ${item.date}`, amount: `− ${money(item.amount)}`, color: C.red })),
  ].slice(0, 5);

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.topCopy}>
          <Eyebrow>{displayDate}</Eyebrow>
          <Title subtitle="Sales, purchases and stock—right where you need them.">Good morning</Title>
        </View>
      </View>

      <Pressable onPress={() => onNavigate('purchase-scan')} style={({ pressed }) => [styles.scanHero, compact && styles.scanHeroCompact, pressed && styles.pressed]}>
        <View style={styles.cameraSeal}>
          <CameraIcon size={34} color={C.paperLight} />
          <View style={styles.cameraScratch} />
        </View>
        <View style={styles.scanCopy}>
          <Text style={styles.scanLabel}>QUICKEST WAY TO ADD A BILL</Text>
          <Text style={styles.scanTitle}>Point, snap, check, save.</Text>
          <Text style={styles.scanText}>Open the camera or choose a bill photo from your gallery.</Text>
        </View>
        <ArrowRightIcon size={22} color={C.brickDark} />
      </Pressable>

      <View style={styles.primaryActions}>
        <MainAction compact={compact} label="Buy" detail="Scan or enter a purchase" icon={BuyIcon} tone="brick" onPress={() => onNavigate('purchase-scan')} />
        <MainAction compact={compact} label="Sell" detail="Scan or record a sale" icon={SellIcon} tone="green" onPress={() => onNavigate('sales-scan')} />
      </View>

      <View style={styles.summary}>
        <Summary label="Sales this month" value={money(summary.revenue)} />
        <Summary label="Profit after expenses" value={money(summary.profit)} />
        <Summary label="Purchases" value={money(summary.purchases)} />
        <Summary label="Stock to check" value={String(summary.lowStock.length)} warning={summary.lowStock.length > 0} />
      </View>

      <SectionHeader title="Smart follow-ups" detail="Small actions that protect cash and stock" />
      <View style={styles.insights}>
        {insights.map(insight => (
          <Pressable key={insight.id} onPress={() => onNavigate(insight.section)} style={({ pressed }) => [styles.insight, insight.tone === 'red' && styles.insightRed, insight.tone === 'gold' && styles.insightGold, pressed && styles.pressed]}>
            <View style={styles.insightCopy}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDetail}>{insight.detail}</Text>
            </View>
            <View style={styles.insightAction}><Text style={styles.insightActionText}>{insight.id === 'margin' ? `${Math.round(insight.amount || 0)}%` : insight.amount ? money(insight.amount) : 'Open'}</Text><ArrowRightIcon size={14} color={insight.tone === 'red' ? C.red : insight.tone === 'gold' ? C.goldDark : C.greenDark} /></View>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Everything in your book" detail="Tap any tool to open it" />
      <View style={styles.tileGrid}>
        {destinations.map((item, index) => {
          const Icon = item.icon; return (
            <Pressable key={item.section} onPress={() => onNavigate(item.section)} style={({ pressed }) => [styles.tile, compact && styles.tileCompact, pressed && styles.pressed]}>
              <View style={[styles.tileIcon, index % 3 === 1 && styles.tileIconSage, index % 3 === 2 && styles.tileIconGold]}><Icon size={22} color={C.brickDark} /></View>
              <View style={styles.tileCopy}>
                <Text style={styles.tileTitle}>{item.label}</Text>
                <Text style={styles.tileDetail}>{item.detail}</Text>
              </View>
              <ArrowRightIcon size={15} color={C.muted} />
            </Pressable>
          );
        })}
      </View>

      {summary.lowStock.length > 0 && (
        <Pressable onPress={() => onNavigate('inventory')} style={({ pressed }) => [styles.notice, pressed && styles.pressed]}>
          <AlertTriangleIcon size={19} color={C.red} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              {summary.lowStock.length}
              {' '}
              stock item
              {summary.lowStock.length === 1 ? '' : 's'}
              {' '}
              need a look
            </Text>
            <Text style={styles.noticeText}>{summary.lowStock.slice(0, 3).map(item => item.name).join(' · ')}</Text>
          </View>
          <ArrowRightIcon size={16} color={C.red} />
        </Pressable>
      )}

      <SectionHeader title="Latest entries" detail="Most recent activity" />
      <Card style={styles.ledger}>
        {activity.length
          ? activity.map((item, index) => (
              <View key={item.id} style={[styles.activity, index < activity.length - 1 && styles.activityRule]}>
                <View style={styles.activityMark}><Text style={styles.activityMarkText}>{index + 1}</Text></View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDetail}>{item.detail}</Text>
                </View>
                <Text style={[styles.activityAmount, { color: item.color }]}>{item.amount}</Text>
              </View>
            ))
          : (
              <View style={styles.empty}>
                <Text style={styles.activityTitle}>No entries yet</Text>
                <Text style={styles.activityDetail}>Your first sale or purchase will appear here.</Text>
              </View>
            )}
      </Card>
    </Screen>
  );
}

function MainAction({ compact, label, detail, icon: Icon, tone, onPress }: { compact: boolean; label: string; detail: string; icon: typeof BuyIcon; tone: 'brick' | 'green'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mainAction, compact && styles.mainActionCompact, tone === 'green' && styles.mainActionGreen, pressed && styles.pressed]}>
      <View style={[styles.mainActionIcon, compact && styles.mainActionIconCompact]}><Icon size={compact ? 23 : 29} color={tone === 'green' ? C.greenDark : C.brickDark} /></View>
      <View style={styles.mainActionCopy}>
        <Text style={[styles.mainActionTitle, compact && styles.mainActionTitleCompact]}>{label}</Text>
        <Text style={[styles.mainActionDetail, compact && styles.mainActionDetailCompact]}>{detail}</Text>
      </View>
      <ArrowRightIcon size={19} color={tone === 'green' ? C.greenDark : C.brickDark} />
    </Pressable>
  );
}

function Summary({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, warning && styles.summaryWarning]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  topCopy: { flex: 1, minWidth: 220 },
  scanHero: { minHeight: 132, flexDirection: 'row', alignItems: 'center', gap: 17, padding: 18, backgroundColor: C.yellowLight, borderColor: C.gold, borderWidth: 1, borderRadius: 12, transform: [{ rotate: '-0.25deg' }] },
  scanHeroCompact: { alignItems: 'flex-start' },
  cameraSeal: { width: 66, height: 66, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: C.brick, borderColor: C.brickDark, borderWidth: 2, transform: [{ rotate: '-3deg' }] },
  cameraScratch: { position: 'absolute', width: 45, height: 1, bottom: 8, backgroundColor: 'rgba(255,255,255,0.35)', transform: [{ rotate: '5deg' }] },
  scanCopy: { flex: 1, minWidth: 0 },
  scanLabel: { color: C.goldDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  scanTitle: { color: C.ink, fontSize: 24, lineHeight: 29, fontWeight: '800', fontFamily: SERIF, marginTop: 5 },
  scanText: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  primaryActions: { flexDirection: 'row', gap: 10 },
  mainAction: { flex: 1, minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, backgroundColor: C.redLight, borderColor: C.mud, borderWidth: 1, borderRadius: 10 },
  mainActionCompact: { minHeight: 78, gap: 7, padding: 10 },
  mainActionGreen: { backgroundColor: C.greenLight, borderColor: C.green },
  mainActionIcon: { width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderColor: 'rgba(44,33,21,0.15)', borderWidth: 1, transform: [{ rotate: '2deg' }] },
  mainActionIconCompact: { width: 35, height: 35, borderRadius: 12 },
  mainActionCopy: { flex: 1 },
  mainActionTitle: { color: C.ink, fontSize: 21, fontWeight: '800', fontFamily: SERIF },
  mainActionTitleCompact: { fontSize: 18 },
  mainActionDetail: { color: C.muted, fontSize: 11, marginTop: 3 },
  mainActionDetailCompact: { fontSize: 9, lineHeight: 12 },
  summary: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.ink, borderRadius: 9, padding: 1, gap: 1, overflow: 'hidden' },
  summaryItem: { flex: 1, minWidth: 145, minHeight: 83, justifyContent: 'center', padding: 13, backgroundColor: '#3A2B1D' },
  summaryLabel: { color: 'rgba(250,243,229,0.63)', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { color: C.paperLight, fontSize: 19, fontWeight: '800', fontFamily: SERIF, marginTop: 7 },
  summaryWarning: { color: '#E7C37B' },
  insights: { gap: 8 },
  insight: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, borderRadius: 9 },
  insightRed: { backgroundColor: C.redLight, borderColor: '#D9A693' },
  insightGold: { backgroundColor: C.yellowLight, borderColor: C.gold },
  insightCopy: { flex: 1, minWidth: 0, gap: 4 },
  insightTitle: { color: C.ink, fontSize: 13, fontWeight: '900' },
  insightDetail: { color: C.muted, fontSize: 11, lineHeight: 16 },
  insightAction: { alignItems: 'flex-end', gap: 4 },
  insightActionText: { color: C.ink, fontSize: 11, fontWeight: '900' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tile: { flexGrow: 1, flexBasis: 230, minWidth: 205, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 9 },
  tileCompact: { flexBasis: 145, minWidth: 140 },
  tileIcon: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.redLight, borderColor: '#DDB5A7', borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  tileIconSage: { backgroundColor: C.greenLight, borderColor: '#BCCDB1', transform: [{ rotate: '2deg' }] },
  tileIconGold: { backgroundColor: C.yellowLight, borderColor: '#DFC98F', transform: [{ rotate: '-1deg' }] },
  tileCopy: { flex: 1, minWidth: 0 },
  tileTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  tileDetail: { color: C.muted, fontSize: 10, marginTop: 3 },
  notice: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, backgroundColor: C.redLight, borderColor: '#D9A693', borderWidth: 1, borderRadius: 9 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: C.red, fontSize: 13, fontWeight: '800' },
  noticeText: { color: C.muted, fontSize: 11, marginTop: 4 },
  ledger: { paddingVertical: 3, gap: 0 },
  activity: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  activityRule: { borderBottomColor: C.border, borderBottomWidth: 1 },
  activityMark: { width: 27, height: 27, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bone, borderColor: C.border, borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  activityMarkText: { color: C.muted, fontSize: 10, fontFamily: SERIF, fontStyle: 'italic' },
  activityCopy: { flex: 1, minWidth: 0 },
  activityTitle: { color: C.ink, fontSize: 13, fontWeight: '800' },
  activityDetail: { color: C.muted, fontSize: 10, marginTop: 3 },
  activityAmount: { fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 25 },
  pressed: { opacity: 0.73, transform: [{ scale: 0.99 }] },
});

export default DashboardScreen;
