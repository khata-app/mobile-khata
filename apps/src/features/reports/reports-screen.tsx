import type { ReportBundle, ReportPeriod } from './report-utils';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BoxIcon, BuildingIcon, DownloadIcon, LedgerIcon, ReceiptIcon, ScaleIcon, TrendingUpIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Eyebrow, Screen, SectionHeader, Text, Title } from '@/features/khata/ui';
import { buildReports, reportRows, rowsToCsv } from './report-utils';

type ReportKind = 'day-book' | 'trial-balance' | 'profit-loss' | 'balance-sheet' | 'vat-summary' | 'stock-report';

const reportKinds: Array<{ id: ReportKind; title: string; description: string; icon: typeof LedgerIcon }> = [
  { id: 'day-book', title: 'Day book', description: 'Every sale, purchase and payment', icon: LedgerIcon },
  { id: 'trial-balance', title: 'Trial balance', description: 'Debit and credit totals', icon: ScaleIcon },
  { id: 'profit-loss', title: 'Profit & loss', description: 'Income, cost and expenses', icon: TrendingUpIcon },
  { id: 'balance-sheet', title: 'Balance sheet', description: 'What the business owns and owes', icon: BuildingIcon },
  { id: 'vat-summary', title: 'VAT summary', description: 'Output and input VAT', icon: ReceiptIcon },
  { id: 'stock-report', title: 'Stock report', description: 'Quantity, value and reorder pressure', icon: BoxIcon },
];

const money = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;
function month(offset = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
}
const monthLabel = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`));

export function ReportsScreen({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const company = useKhataStore.use.company();
  const bills = useKhataStore.use.bills();
  const sales = useKhataStore.use.sales();
  const expenses = useKhataStore.use.expenses();
  const benefits = useKhataStore.use.benefits();
  const inventory = useKhataStore.use.inventory();
  const [period, setPeriod] = useState<ReportPeriod>('all');
  const [kind, setKind] = useState<ReportKind>('profit-loss');
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const bundle = useMemo(() => buildReports({ bills, sales, expenses, benefits, inventory, vatRate: company.vatRate }, period), [benefits, bills, company.vatRate, expenses, inventory, period, sales]);
  const selected = reportKinds.find(item => item.id === kind) || reportKinds[0];
  const rows = reportRows(bundle, kind);
  const columns = rows.length ? Object.keys(rows[0]) : [];

  const exportReport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      const safeName = `khata-${kind}-${period === 'all' ? 'all' : period}`;
      const csv = rowsToCsv(rows);
      if (format === 'excel') {
        if (Platform.OS === 'web') {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${safeName}.csv`;
          anchor.click();
          URL.revokeObjectURL(url);
        }
        else {
          const uri = `${FileSystem.cacheDirectory}${safeName}.csv`;
          await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
          if (await Sharing.isAvailableAsync())
            await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export Khata report to Excel' });
        }
        return;
      }
      const html = reportHtml(company.name, selected.title, bundle.periodLabel, rows);
      if (Platform.OS === 'web') {
        const popup = window.open('', '_blank');
        if (!popup)
          throw new Error('Allow pop-ups to print this report as PDF.');
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
      }
      else {
        const result = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Export Khata report as PDF' });
      }
    }
    finally {
      setExporting(null);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Eyebrow>
            {company.name}
            {' '}
            ·
            {' '}
            {bundle.periodLabel}
          </Eyebrow>
          <Title subtitle="Accounting views built from the same workspace records.">Reports</Title>
        </View>
        <Chip tone="green">Live workspace data</Chip>
      </View>
      <Card style={styles.hero}>
        <View style={styles.heroCopy}>
          <Eyebrow>{selected.title}</Eyebrow>
          <Text style={styles.heroTitle}>{heroValue(kind, bundle)}</Text>
          <Text style={styles.heroText}>
            {selected.description}
            . Choose a period or export this report.
          </Text>
        </View>
        <View style={styles.heroAside}>
          <Text style={styles.heroAsideLabel}>Entries</Text>
          <Text style={styles.heroAsideValue}>{bundle.dayBook.length}</Text>
          <Text style={styles.heroAsideHint}>rows in this view</Text>
        </View>
      </Card>

      <SectionHeader title="Period" detail="Use all entries or narrow to a month" />
      <View style={styles.periods}>{[['all', 'All time'], [month(), 'This month'], [month(-1), monthLabel(month(-1))]].map(([value, label]) => <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.period, period === value && styles.periodActive]}><Text style={[styles.periodText, period === value && styles.periodTextActive]}>{label}</Text></Pressable>)}</View>

      <SectionHeader title="Choose a report" detail="All views stay inside this screen" />
      <View style={styles.reportTabs}>
        {reportKinds.map((item) => {
          const Icon = item.icon; return (
            <Pressable key={item.id} onPress={() => setKind(item.id)} style={[styles.reportTab, kind === item.id && styles.reportTabActive]}>
              <View style={[styles.reportIcon, kind === item.id && styles.reportIconActive]}><Icon size={18} color={kind === item.id ? C.paperLight : C.brickDark} /></View>
              <View style={styles.reportTabCopy}>
                <Text style={[styles.reportTabTitle, kind === item.id && styles.reportTabTitleActive]}>{item.title}</Text>
                <Text style={[styles.reportTabDetail, kind === item.id && styles.reportTabDetailActive]}>{item.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ReportHighlights bundle={bundle} kind={kind} />
      <View style={styles.tableHeader}>
        <View style={styles.tableTitle}>
          <Text style={styles.tableTitleText}>{selected.title}</Text>
          <Text style={styles.tableDetail}>
            {rows.length}
            {' '}
            rows ·
            {' '}
            {bundle.periodLabel}
          </Text>
        </View>
        <View style={styles.exportActions}>
          <Button label={exporting === 'pdf' ? 'Preparing…' : 'PDF'} variant="outline" icon={<DownloadIcon size={14} color={C.brick} />} onPress={() => { void exportReport('pdf'); }} disabled={Boolean(exporting)} />
          <Button label={exporting === 'excel' ? 'Preparing…' : 'Excel'} icon={<DownloadIcon size={14} color={C.white} />} onPress={() => { void exportReport('excel'); }} disabled={Boolean(exporting)} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Card style={styles.tableCard}>
          {rows.length
            ? (
                <>
                  <View style={styles.rowHeader}>{columns.map(column => <Text key={column} style={[styles.cell, styles.headerCell]}>{column}</Text>)}</View>
                  {rows.map((row, index) => <View key={`${kind}-${index}`} style={styles.dataRow}>{columns.map(column => <Text key={column} style={styles.cell} numberOfLines={2}>{formatCell(row[column], column)}</Text>)}</View>)}
                </>
              )
            : (
                <View style={styles.noData}>
                  <Text style={styles.noDataTitle}>No entries for this period</Text>
                  <Text style={styles.noDataText}>Add a sale, purchase or expense to populate this report.</Text>
                </View>
              )}
        </Card>
      </ScrollView>
      <Text style={styles.disclaimer}>These totals use the sales, purchases and expenses saved in this workspace. VAT uses the amount on each purchase bill and the business VAT rate.</Text>
    </Screen>
  );
}

function heroValue(kind: ReportKind, bundle: ReportBundle) {
  if (kind === 'profit-loss')
    return money(bundle.profitLoss.netProfit);
  if (kind === 'balance-sheet')
    return money(bundle.balanceSheet.totalAssets);
  if (kind === 'vat-summary')
    return money(bundle.vatSummary.netVat);
  if (kind === 'stock-report')
    return money(bundle.stockReport.reduce((sum, row) => sum + row.value, 0));
  if (kind === 'trial-balance')
    return `${money(bundle.trialBalance.totalDebit)} balanced`;
  return `${bundle.dayBook.length} journal lines`;
}

function ReportHighlights({ bundle, kind }: { bundle: ReportBundle; kind: ReportKind }) {
  if (kind === 'profit-loss')
    return <View style={styles.highlights}>{[['Revenue', bundle.profitLoss.revenue], ['Gross profit', bundle.profitLoss.grossProfit], ['Net profit', bundle.profitLoss.netProfit]].map(([label, value]) => <MiniMetric key={String(label)} label={String(label)} value={money(Number(value))} />)}</View>;
  if (kind === 'balance-sheet')
    return <View style={styles.highlights}>{[['Assets', bundle.balanceSheet.totalAssets], ['Liabilities', bundle.balanceSheet.liabilities.reduce((sum, row) => sum + row.amount, 0)], ['Equity', bundle.balanceSheet.equity]].map(([label, value]) => <MiniMetric key={String(label)} label={String(label)} value={money(Number(value))} />)}</View>;
  if (kind === 'vat-summary')
    return <View style={styles.highlights}>{[['Output VAT', bundle.vatSummary.outputVat], ['Input VAT', bundle.vatSummary.inputVat], ['Net payable / credit', bundle.vatSummary.netVat]].map(([label, value]) => <MiniMetric key={String(label)} label={String(label)} value={money(Number(value))} />)}</View>;
  if (kind === 'stock-report')
    return <View style={styles.highlights}>{[['Stock value', bundle.stockReport.reduce((sum, row) => sum + row.value, 0)], ['Selling value', bundle.stockReport.reduce((sum, row) => sum + row.sellingValue, 0)], ['Low stock', bundle.stockReport.filter(row => row.low).length]].map(([label, value]) => <MiniMetric key={String(label)} label={String(label)} value={typeof value === 'number' && label !== 'Low stock' ? money(value) : String(value)} />)}</View>;
  return (
    <View style={styles.highlights}>
      <MiniMetric label="Debit total" value={money(bundle.trialBalance.totalDebit)} />
      <MiniMetric label="Credit total" value={money(bundle.trialBalance.totalCredit)} />
      <MiniMetric label="Day book lines" value={String(bundle.dayBook.length)} />
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}
function formatCell(value: string | number | undefined, column: string) {
  if (typeof value === 'number' && (column === 'Amount' || column === 'Debit' || column === 'Credit' || column.includes('value') || column.includes('VAT') || column === 'Margin'))
    return money(value); return String(value ?? '—');
}

function reportHtml(company: string, title: string, period: string, rows: Array<Record<string, string | number>>) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const escape = (value: unknown) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)} · ${escape(company)}</title><style>body{font-family:Arial,sans-serif;color:#111827;padding:32px}h1{margin-bottom:4px}p{color:#64748b}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{text-align:left;border-bottom:1px solid #dbe3ef;padding:10px;font-size:12px}th{background:#111827;color:#fff}</style></head><body><h1>${escape(company)} — ${escape(title)}</h1><p>${escape(period)} · Generated by Khata</p><table><thead><tr>${columns.map(column => `<th>${escape(column)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(column => `<td>${escape(row[column])}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload=function(){window.print()}</script></body></html>`;
}

export default ReportsScreen;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  headerCopy: { flex: 1, minWidth: 0 },
  hero: { flexDirection: 'row', alignItems: 'stretch', gap: 18, backgroundColor: C.paperLight, borderColor: C.gold, borderRadius: 10 },
  heroCopy: { flex: 1, minWidth: 220, gap: 10 },
  heroTitle: { color: C.brickDark, fontSize: 30, lineHeight: 34, fontWeight: '900' },
  heroText: { color: C.muted, fontSize: 13, lineHeight: 20 },
  heroAside: { minWidth: 130, justifyContent: 'flex-end', padding: 14, backgroundColor: C.yellowLight, borderColor: C.gold, borderWidth: 1, transform: [{ rotate: '1deg' }] },
  heroAsideLabel: { color: C.ink, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  heroAsideValue: { color: C.ink, fontSize: 31, fontWeight: '900', marginTop: 5 },
  heroAsideHint: { color: 'rgba(8,11,20,0.65)', fontSize: 10, lineHeight: 14 },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  period: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1 },
  periodActive: { backgroundColor: C.brick, borderColor: C.brickDark },
  periodText: { color: C.muted, fontSize: 12, fontWeight: '800' },
  periodTextActive: { color: C.white },
  reportTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reportTab: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1 },
  reportTabActive: { backgroundColor: C.brickDark, borderColor: C.brickDark },
  reportIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.redLight, borderColor: '#DDB5A7', borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  reportIconActive: { backgroundColor: C.brick, borderColor: C.paperLight },
  reportTabCopy: { flex: 1, gap: 3 },
  reportTabTitle: { color: C.ink, fontSize: 13, fontWeight: '900' },
  reportTabTitleActive: { color: C.white },
  reportTabDetail: { color: C.muted, fontSize: 10, lineHeight: 14 },
  reportTabDetailActive: { color: 'rgba(255,255,255,0.65)' },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniMetric: { flex: 1, minWidth: 145, padding: 14, backgroundColor: C.bone, borderLeftColor: C.gold, borderLeftWidth: 3 },
  miniLabel: { color: C.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  miniValue: { color: C.ink, fontSize: 18, fontWeight: '900', marginTop: 8 },
  tableHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 10 },
  tableTitle: { flex: 1, minWidth: 170, gap: 3 },
  tableTitleText: { color: C.ink, fontSize: 19, fontWeight: '900' },
  tableDetail: { color: C.muted, fontSize: 11 },
  exportActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tableCard: { padding: 0, overflow: 'hidden', gap: 0 },
  rowHeader: { flexDirection: 'row', minWidth: 620, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: C.ink },
  dataRow: { flexDirection: 'row', minWidth: 620, paddingHorizontal: 12, paddingVertical: 12, borderBottomColor: C.border, borderBottomWidth: 1 },
  cell: { flex: 1, minWidth: 95, paddingRight: 8, color: C.ink, fontSize: 11, lineHeight: 16 },
  headerCell: { color: C.white, fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
  noData: { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 18 },
  noDataTitle: { color: C.ink, fontSize: 16, fontWeight: '900' },
  noDataText: { color: C.muted, fontSize: 12, marginTop: 7 },
  disclaimer: { color: C.muted, fontSize: 10, lineHeight: 16 },
});
