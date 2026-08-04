import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { useKhataStore } from '@/features/khata/store';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { C, SERIF } from '@/features/khata/ui';
import { ArrowUpRightIcon, BarChartIcon, BoxIcon, BuildingIcon, CaretDownIcon, CartIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CoinsIcon, FileTextIcon, GridIcon, HomeIcon, KhataMark, LogOutIcon, MoreIcon, PlusIcon, ReceiptIcon, UsersIcon } from '@/features/khata/icons';
import DashboardScreen from '@/features/dashboard/dashboard-screen';
import { BillsPanel, EmployeesPanel, ExpensesPanel, InventoryPanel, PurchasePanel, SalesInvoicePanel, SalesPanel } from './workspace-panels';

type Section = 'dashboard' | 'purchase-scan' | 'sales-scan' | 'bills' | 'inventory' | 'sales' | 'expenses' | 'employees' | 'reports' | 'settings';

const nav: Array<{ id: Section; label: string; icon: typeof GridIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon },
  { id: 'purchase-scan', label: 'Purchases', icon: CartIcon },
  { id: 'sales-scan', label: 'Sales invoices', icon: FileTextIcon },
  { id: 'bills', label: 'Bills', icon: ReceiptIcon },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'sales', label: 'Sales', icon: BarChartIcon },
  { id: 'expenses', label: 'Expenses', icon: CoinsIcon },
  { id: 'employees', label: 'Employees', icon: UsersIcon },
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

  return <SafeAreaView style={styles.safe}><FocusAwareStatusBar /><View style={styles.appFrame}>{desktop ? <View style={styles.desktopRow}><Sidebar active={section} onNavigate={navigate} company={company.name} /><View style={styles.desktopContent}>{content}</View></View> : <><MobileHeader active={section} onNavigate={navigate} company={company.name} /><View style={styles.mobileContent}>{content}</View><MobileNav active={section} onNavigate={navigate} /></>}</View></SafeAreaView>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={styles.brand}><View style={styles.logo}><KhataMark size={24} color={C.white} /></View>{!compact && <View><Text style={styles.brandName}>Khata</Text><Text style={styles.brandSub}>Nepal accounting workspace</Text></View>}</View>;
}

function Sidebar({ active, onNavigate, company }: { active: Section; onNavigate: (section: string) => void; company: string }) {
  return <View style={styles.sidebar}><Brand /><Pressable onPress={() => router.push('/company')} style={({ pressed }) => [styles.companyChip, pressed && { opacity: 0.85 }]}><View style={{ flex: 1 }}><Text style={styles.companyName}>{company}</Text><Text style={styles.companyMeta}>NPR · Kathmandu</Text></View><CaretDownIcon size={15} color="rgba(255,255,255,0.7)" /></Pressable><View style={styles.nav}>{nav.map(item => <NavButton key={item.id} item={item} active={active === item.id} onPress={() => onNavigate(item.id)} />)}</View><View style={styles.sidebarFooter}><Text style={styles.footerText}>Khata keeps your business in perfect balance.</Text><Pressable onPress={signOut} style={styles.footerLink}><LogOutIcon size={15} color="#E4C077" /><Text style={styles.footerLinkText}>Sign out</Text></Pressable></View></View>;
}

function NavButton({ item, active, onPress }: { item: (typeof nav)[number]; active: boolean; onPress: () => void }) {
  const Icon = item.icon;
  return <Pressable onPress={onPress} style={[styles.navButton, active && styles.navButtonActive]}><View style={[styles.navIcon, active && styles.navIconActive]}><Icon size={16} color={active ? C.white : 'rgba(255,255,255,0.75)'} /></View><Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text></Pressable>;
}

function MobileHeader({ active, onNavigate, company }: { active: Section; onNavigate: (section: string) => void; company: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <View style={styles.mobileHeader}>{active !== 'dashboard' && <Pressable onPress={() => onNavigate('dashboard')} style={styles.backButton}><ChevronLeftIcon size={21} color={C.ink} /></Pressable>}<Brand compact /><View style={{ flex: 1 }}><Pressable onPress={() => setMenuOpen(true)} style={styles.companyButton}><Text style={styles.mobileCompany} numberOfLines={1}>{company}</Text><CaretDownIcon size={14} color={C.muted} /></Pressable><Text style={styles.mobileSection}>{nav.find(item => item.id === active)?.label || 'Dashboard'}</Text></View><Pressable style={styles.switchButton} onPress={() => onNavigate('settings')}><MoreIcon size={20} color={C.ink} /></Pressable><CompanyMenu visible={menuOpen} onClose={() => setMenuOpen(false)} company={company} /></View>;
}

function CompanyMenu({ visible, onClose, company }: { visible: boolean; onClose: () => void; company: string }) {
  const items: Array<{ icon: typeof BuildingIcon; label: string; detail: string; onPress: () => void }> = [
    { icon: BuildingIcon, label: 'Switch company', detail: 'Open a different workspace', onPress: () => { onClose(); router.push('/company'); } },
    { icon: LogOutIcon, label: 'Sign out', detail: 'End this session on this device', onPress: async () => { onClose(); await signOut(); } },
  ];
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={styles.menuCard}>
        <View style={styles.menuHead}><BuildingIcon size={18} color={C.brick} /><View style={{ flex: 1 }}><Text style={styles.menuTitle} numberOfLines={1}>{company}</Text><Text style={styles.menuDetail}>Current workspace · NPR</Text></View><CheckIcon size={16} color={C.green} /></View>
        {items.map(item => { const Icon = item.icon; return <Pressable key={item.label} onPress={item.onPress} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.75 }]}><View style={styles.menuIconBox}><Icon size={17} color={C.brick} /></View><View style={{ flex: 1 }}><Text style={styles.menuItemText}>{item.label}</Text><Text style={styles.menuItemDetail}>{item.detail}</Text></View><ChevronRightIcon size={16} color={C.muted} /></Pressable>; })}
      </View>
    </Pressable>
  </Modal>;
}

function MobileNav({ active, onNavigate }: { active: Section; onNavigate: (section: string) => void }) {
  const items: Array<{ id: Section; label: string; icon: typeof GridIcon }> = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon },
    { id: 'purchase-scan', label: 'Buy', icon: PlusIcon },
    { id: 'sales-scan', label: 'Sell', icon: ArrowUpRightIcon },
    { id: 'inventory', label: 'Stock', icon: BoxIcon },
    { id: 'settings', label: 'More', icon: MoreIcon },
  ];
  return <View style={styles.mobileNav}>{items.map(item => { const Icon = item.icon; return <Pressable key={item.id} onPress={() => onNavigate(item.id)} style={styles.mobileNavItem}><Icon size={21} color={active === item.id ? C.brick : C.muted} /><Text style={[styles.mobileNavLabel, active === item.id && { color: C.brick, fontWeight: '800' }]}>{item.label}</Text></Pressable>; })}</View>;
}

const signOut = async () => { await useAuth.getState().signOut(); router.replace('/login'); };

export default WorkspaceScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  appFrame: { flex: 1 },
  desktopRow: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 252, backgroundColor: C.brickDark, paddingHorizontal: 12, paddingTop: 22, paddingBottom: 18, gap: 14, overflow: 'hidden' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  logo: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: C.gold },
  brandName: { color: C.white, fontSize: 22, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.3 },
  brandSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  companyChip: { marginHorizontal: 4, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  companyName: { color: C.white, fontWeight: '800', fontSize: 13 },
  companyMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 },
  nav: { flex: 1, gap: 5 },
  navButton: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10 },
  navButtonActive: { backgroundColor: 'rgba(255,255,255,0.13)' },
  navIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  navIconActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  navLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 13, flex: 1 },
  navLabelActive: { color: C.white, fontWeight: '800' },
  sidebarFooter: { borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, paddingTop: 14, gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  footerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footerLinkText: { color: '#E4C077', textAlign: 'center', fontSize: 12, fontWeight: '800' },
  desktopContent: { flex: 1, minWidth: 0, backgroundColor: C.cream },
  mobileHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.paperLight, borderBottomColor: C.border, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  companyButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mobileCompany: { color: C.ink, fontWeight: '800', fontSize: 13, flexShrink: 1 },
  mobileSection: { color: C.muted, fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  switchButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  overlay: { flex: 1, backgroundColor: 'rgba(44,33,21,0.4)', justifyContent: 'center', paddingHorizontal: 28 },
  menuCard: { backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 8, gap: 4 },
  menuHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomColor: C.border, borderBottomWidth: 1, marginBottom: 4 },
  menuTitle: { color: C.ink, fontWeight: '800', fontSize: 15 },
  menuDetail: { color: C.muted, fontSize: 11, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 11 },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { color: C.ink, fontWeight: '700', fontSize: 14 },
  menuItemDetail: { color: C.muted, fontSize: 11, marginTop: 2 },
  mobileContent: { flex: 1, backgroundColor: C.cream },
  mobileNav: { flexDirection: 'row', backgroundColor: C.paperLight, borderTopColor: C.border, borderTopWidth: 1, paddingBottom: 6, paddingTop: 8 },
  mobileNavItem: { flex: 1, alignItems: 'center', gap: 3 },
  mobileNavLabel: { color: C.muted, fontSize: 10, fontWeight: '700' },
});
