import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { useKhataStore } from '@/features/khata/store';
import { C } from '@/features/khata/ui';
import DashboardScreen from '@/features/dashboard/dashboard-screen';
import { BillsPanel, EmployeesPanel, ExpensesPanel, InventoryPanel, PurchasePanel, SalesInvoicePanel, SalesPanel } from './workspace-panels';

type Section = 'dashboard' | 'purchase-scan' | 'sales-scan' | 'bills' | 'inventory' | 'sales' | 'expenses' | 'employees' | 'reports' | 'settings';

const nav: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '▥' }, { id: 'purchase-scan', label: 'Purchases', icon: '＋' }, { id: 'sales-scan', label: 'Sales invoices', icon: '▤' }, { id: 'bills', label: 'Bills', icon: '▣' }, { id: 'inventory', label: 'Inventory', icon: '□' }, { id: 'sales', label: 'Sales', icon: '◒' }, { id: 'expenses', label: 'Expenses', icon: '◇' }, { id: 'employees', label: 'Employees', icon: '◎' },
];

export function WorkspaceScreen() {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 900;
  const [section, setSection] = useState<Section>('dashboard');
  const hydrate = useKhataStore.use.hydrate();
  const hydrated = useKhataStore.use.hydrated();
  const company = useKhataStore.use.company();
  const bills = useKhataStore.use.bills();
  const inventory = useKhataStore.use.inventory();
  const sales = useKhataStore.use.sales();
  const expenses = useKhataStore.use.expenses();
  const employees = useKhataStore.use.employees();
  const benefits = useKhataStore.use.benefits();
  useEffect(() => { if (!hydrated) hydrate(); }, [hydrate, hydrated]);

  const navigate = (next: string) => {
    if (next === 'reports' || next === 'settings') { router.push(`/(app)/${next}` as never); return; }
    setSection(next as Section);
  };

  const content = section === 'dashboard' ? <DashboardScreen bills={bills} inventory={inventory} sales={sales} expenses={expenses} employees={employees} benefits={benefits} onNavigate={navigate} />
    : section === 'purchase-scan' ? <PurchasePanel onNavigate={navigate} />
      : section === 'sales-scan' ? <SalesInvoicePanel onNavigate={navigate} />
        : section === 'bills' ? <BillsPanel onNavigate={navigate} />
          : section === 'inventory' ? <InventoryPanel />
            : section === 'sales' ? <SalesPanel onNavigate={navigate} />
              : section === 'expenses' ? <ExpensesPanel />
                : <EmployeesPanel />;

  return <SafeAreaView style={styles.safe}><FocusAwareStatusBar /><View style={styles.appFrame}>{desktop && <Sidebar active={section} onNavigate={navigate} company={company.name} />}{!desktop && <MobileHeader active={section} onNavigate={navigate} company={company.name} />}{desktop ? <View style={styles.content}>{content}</View> : <View style={styles.mobileContent}>{content}</View>}{!desktop && <MobileNav active={section} onNavigate={navigate} />}</View></SafeAreaView>;
}

function Brand({ compact = false }: { compact?: boolean }) { return <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>⌂</Text></View>{!compact && <View><Text style={styles.brandName}>Khata</Text><Text style={styles.brandSub}>Nepal accounting workspace</Text></View>}</View>; }
function Sidebar({ active, onNavigate, company }: { active: Section; onNavigate: (section: string) => void; company: string }) { return <View style={styles.sidebar}><Brand /><View style={styles.companyChip}><Text style={styles.companyName}>{company}</Text><Text style={styles.companyMeta}>NPR · Kathmandu</Text></View><View style={styles.nav}>{nav.map(item => <NavButton key={item.id} item={item} active={active === item.id} onPress={() => onNavigate(item.id)} />)}</View><View style={styles.sidebarFooter}><Text style={styles.footerText}>Khata keeps your business in perfect balance.</Text><Pressable onPress={() => onNavigate('settings')}><Text style={styles.footerLink}>Settings →</Text></Pressable></View></View>; }
function NavButton({ item, active, onPress }: { item: (typeof nav)[number]; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.navButton, active && styles.navButtonActive]}><View style={[styles.navIcon, active && styles.navIconActive]}><Text style={[styles.navIconText, active && { color: C.white }]}>{item.icon}</Text></View><Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text></Pressable>; }
function MobileHeader({ active, onNavigate, company }: { active: Section; onNavigate: (section: string) => void; company: string }) { return <View style={styles.mobileHeader}><Brand compact /><View style={{ flex: 1 }}><Text style={styles.mobileCompany}>{company}</Text><Text style={styles.mobileSection}>{nav.find(item => item.id === active)?.label || 'Dashboard'}</Text></View><Pressable style={styles.switchButton} onPress={() => onNavigate('settings')}><Text style={styles.switchText}>•••</Text></Pressable></View>; }
function MobileNav({ active, onNavigate }: { active: Section; onNavigate: (section: string) => void }) { const items: Array<{ id: Section; label: string; icon: string }> = [{ id: 'dashboard', label: 'Home', icon: '⌂' }, { id: 'purchase-scan', label: 'Buy', icon: '＋' }, { id: 'sales-scan', label: 'Sell', icon: '↗' }, { id: 'inventory', label: 'Stock', icon: '□' }, { id: 'settings', label: 'More', icon: '•••' }]; return <View style={styles.mobileNav}>{items.map(item => <Pressable key={item.id} onPress={() => onNavigate(item.id)} style={styles.mobileNavItem}><Text style={[styles.mobileNavIcon, active === item.id && { color: C.brick }]}>{item.icon}</Text><Text style={[styles.mobileNavLabel, active === item.id && { color: C.brick, fontWeight: '800' }]}>{item.label}</Text></Pressable>)}</View>; }

export default WorkspaceScreen;

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.cream }, appFrame: { flex: 1, flexDirection: 'row' }, sidebar: { width: 252, backgroundColor: C.brickDark, paddingHorizontal: 12, paddingTop: 22, paddingBottom: 18, gap: 14, overflow: 'hidden' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 }, logo: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.gold }, logoText: { color: C.white, fontSize: 25, fontWeight: '800' }, brandName: { color: C.white, fontSize: 22, fontWeight: '800' }, brandSub: { color: 'rgba(255,255,255,.65)', fontSize: 10, marginTop: 2 }, companyChip: { marginHorizontal: 4, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.1)' }, companyName: { color: C.white, fontWeight: '800', fontSize: 13 }, companyMeta: { color: 'rgba(255,255,255,.65)', fontSize: 11, marginTop: 4 }, nav: { flex: 1, gap: 5 }, navButton: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10 }, navButtonActive: { backgroundColor: 'rgba(255,255,255,.13)' }, navIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.1)' }, navIconActive: { backgroundColor: 'rgba(255,255,255,.22)' }, navIconText: { color: 'rgba(255,255,255,.75)', fontSize: 15 }, navLabel: { color: 'rgba(255,255,255,.78)', fontSize: 13, flex: 1 }, navLabelActive: { color: C.white, fontWeight: '800' }, sidebarFooter: { borderTopColor: 'rgba(255,255,255,.12)', borderTopWidth: 1, paddingTop: 14, gap: 8 }, footerText: { color: 'rgba(255,255,255,.6)', fontSize: 11, lineHeight: 16, textAlign: 'center' }, footerLink: { color: '#E4C077', textAlign: 'center', fontSize: 12, fontWeight: '700' }, content: { flex: 1, backgroundColor: C.cream, minWidth: 0 }, mobileHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: C.border, borderBottomWidth: 1, backgroundColor: 'rgba(246,238,225,.95)' }, mobileCompany: { color: C.muted, fontSize: 11 }, mobileSection: { color: C.ink, fontSize: 15, fontWeight: '800', marginTop: 2 }, switchButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.border }, switchText: { color: C.brick, fontWeight: '800', letterSpacing: 2 }, mobileContent: { flex: 1, minHeight: 0 }, mobileNav: { flexDirection: 'row', borderTopColor: C.border, borderTopWidth: 1, backgroundColor: C.white, paddingVertical: 7, paddingHorizontal: 4 }, mobileNavItem: { flex: 1, alignItems: 'center', gap: 3 }, mobileNavIcon: { color: C.muted, fontSize: 19 }, mobileNavLabel: { color: C.muted, fontSize: 10 },
});
