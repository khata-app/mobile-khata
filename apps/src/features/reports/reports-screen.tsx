import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, C, Chip, Eyebrow, Screen, SectionHeader, Text, Title } from '@/features/khata/ui';
import { useKhataStore } from '@/features/khata/store';

const reports = [['📒', 'Day book', 'Every sale, purchase and payment'], ['⚖️', 'Trial balance', 'Debit and credit totals'], ['📈', 'Profit & loss', 'Income and expenses for the period'], ['🏦', 'Balance sheet', 'What your business owns and owes'], ['🧾', 'VAT summary', 'Taxable sales and purchases'], ['📦', 'Stock report', 'Quantity, value and low-stock items']];

export function ReportsScreen() {
  const company = useKhataStore.use.company();
  const sales = useKhataStore.use.sales();
  const expenses = useKhataStore.use.expenses();
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = revenue - sales.reduce((sum, sale) => sum + sale.cost, 0) - expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return <Screen><Title subtitle={`${company.name} · FY ${company.fiscalYear}`}>Reports</Title><Card style={{ backgroundColor: C.brickDark, borderColor: C.brickDark }}><Eyebrow>This month</Eyebrow><Text style={{ color: C.white, fontSize: 28, fontWeight: '800' }}>NPR {profit.toLocaleString()}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12 }}>Net profit · Revenue NPR {revenue.toLocaleString()}</Text><Chip tone="gold">Accounting-ready report surface</Chip></Card><SectionHeader title="Financial reports" detail="Open a trusted view of your business" /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{reports.map(([icon, title, description]) => <Card key={title} style={{ flexGrow: 1, flexBasis: '30%', minWidth: 145 }}><Text style={{ fontSize: 25 }}>{icon}</Text><Text style={{ color: C.ink, fontWeight: '800', marginTop: 3 }}>{title}</Text><Text style={{ color: C.muted, fontSize: 12, lineHeight: 17 }}>{description}</Text><Button label="Open report →" variant="ghost" /></Card>)}</View><Card style={{ backgroundColor: C.greenLight, borderColor: '#C5D6BA', alignItems: 'center' }}><Text style={{ color: C.greenDark, fontWeight: '800' }}>Export reports</Text><Text style={{ color: C.greenDark, fontSize: 12 }}>CSV, PDF and JSON exports</Text><Button label="Back to workspace" variant="outline" onPress={() => router.replace('/')} /></Card></Screen>;
}
export default ReportsScreen;
