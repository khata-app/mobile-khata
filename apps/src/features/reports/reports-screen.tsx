import { router } from 'expo-router';
import { View } from 'react-native';
import { BackButton, Button, Card, C, Chip, Eyebrow, Screen, SERIF, SectionHeader, Text, Title } from '@/features/khata/ui';
import { ArrowRightIcon, BoxIcon, BuildingIcon, LedgerIcon, ReceiptIcon, ScaleIcon, TrendingUpIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';

const reports = [
  { icon: LedgerIcon, title: 'Day book', description: 'Every sale, purchase and payment' },
  { icon: ScaleIcon, title: 'Trial balance', description: 'Debit and credit totals' },
  { icon: TrendingUpIcon, title: 'Profit & loss', description: 'Income and expenses for the period' },
  { icon: BuildingIcon, title: 'Balance sheet', description: 'What your business owns and owes' },
  { icon: ReceiptIcon, title: 'VAT summary', description: 'Taxable sales and purchases' },
  { icon: BoxIcon, title: 'Stock report', description: 'Quantity, value and low-stock items' },
];

export function ReportsScreen() {
  const company = useKhataStore.use.company();
  const sales = useKhataStore.use.sales();
  const expenses = useKhataStore.use.expenses();
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = revenue - sales.reduce((sum, sale) => sum + sale.cost, 0) - expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return <Screen><BackButton onPress={() => router.back()} /><Title subtitle={`${company.name} · FY ${company.fiscalYear}`}>Reports</Title><Card style={{ backgroundColor: C.brickDark, borderColor: C.brickDark }}><Eyebrow>This month</Eyebrow><Text style={{ color: C.white, fontSize: 28, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.5 }}>NPR {profit.toLocaleString()}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12 }}>Net profit · Revenue NPR {revenue.toLocaleString()}</Text><Chip tone="gold">Accounting-ready report surface</Chip></Card><SectionHeader title="Financial reports" detail="Open a trusted view of your business" /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{reports.map(report => <Card key={report.title} style={{ flexGrow: 1, flexBasis: '30%', minWidth: 145 }}><View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' }}><report.icon size={22} color={C.brick} /></View><Text style={{ color: C.ink, fontWeight: '800', marginTop: 8, fontFamily: SERIF, fontSize: 17 }}>{report.title}</Text><Text style={{ color: C.muted, fontSize: 12, lineHeight: 17 }}>{report.description}</Text><Button label="Open report" variant="ghost" icon={<ArrowRightIcon size={14} color={C.brick} />} /></Card>)}</View><Card style={{ backgroundColor: C.greenLight, borderColor: '#C5D6BA', alignItems: 'center' }}><Text style={{ color: C.green, fontWeight: '800', fontFamily: SERIF, fontSize: 17 }}>Export reports</Text><Text style={{ color: C.green, fontSize: 12 }}>CSV, PDF and JSON exports</Text></Card></Screen>;
}
export default ReportsScreen;
