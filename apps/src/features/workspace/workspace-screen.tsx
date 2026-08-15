import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import DashboardScreen from '@/features/dashboard/dashboard-screen';
import { KhataLogo } from '@/features/khata/brand';
import { BarChartIcon, BoxIcon, BuildingIcon, BuyIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CoinsIcon, FileTextIcon, GearIcon, GridIcon, HomeIcon, LogOutIcon, ReceiptIcon, SellIcon, UsersIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { C, SERIF, WorkspaceScreenProvider } from '@/features/khata/ui';
import ReportsScreen from '@/features/reports/reports-screen';
import SettingsScreen from '@/features/settings/settings-screen';
import { InventoryPanel } from './inventory-panel';
import { BillsPanel, EmployeesPanel, ExpensesPanel, PurchasePanel, SalesInvoicePanel, SalesPanel } from './workspace-panels';

type Section = 'dashboard' | 'purchase-scan' | 'sales-scan' | 'bills' | 'inventory' | 'sales' | 'expenses' | 'employees' | 'reports' | 'settings';

const nav: Array<{ id: Section; label: string; icon: typeof GridIcon }> = [
  { id: 'dashboard', label: 'Overview', icon: GridIcon },
  { id: 'purchase-scan', label: 'Purchases', icon: BuyIcon },
  { id: 'sales-scan', label: 'Sales invoices', icon: FileTextIcon },
  { id: 'bills', label: 'Bills', icon: ReceiptIcon },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'sales', label: 'Sales history', icon: BarChartIcon },
  { id: 'expenses', label: 'Expenses', icon: CoinsIcon },
  { id: 'employees', label: 'Team', icon: UsersIcon },
  { id: 'reports', label: 'Reports', icon: FileTextIcon },
  { id: 'settings', label: 'Settings', icon: GearIcon },
];

const mobileNav: Array<{ id: Section; label: string; icon: typeof GridIcon }> = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'purchase-scan', label: 'Buy', icon: BuyIcon },
  { id: 'sales-scan', label: 'Sell', icon: SellIcon },
  { id: 'inventory', label: 'Stock', icon: BoxIcon },
];

export function WorkspaceScreen({ initialSection = 'dashboard' }: { initialSection?: Section }) {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ section?: string }>();
  const desktop = Platform.OS === 'web' && width >= 900;
  const requestedSection = nav.some(item => item.id === params.section) ? params.section as Section : initialSection;
  const [section, setSection] = useState<Section>(requestedSection);
  const history = useRef<Section[]>([requestedSection]);
  const lastRequestedSection = useRef(requestedSection);
  const scrollOffsets = useRef<Record<string, number>>({});
  const updateScrollOffset = useCallback((key: string, offset: number) => {
    scrollOffsets.current[key] = offset;
  }, []);
  const hydrate = useKhataStore.use.hydrate();
  const refresh = useKhataStore.use.refresh();
  const hydrated = useKhataStore.use.hydrated();
  const syncing = useKhataStore.use.syncing();
  const syncError = useKhataStore.use.syncError();
  const company = useKhataStore.use.company();
  const bills = useKhataStore.use.bills();
  const inventory = useKhataStore.use.inventory();
  const sales = useKhataStore.use.sales();
  const expenses = useKhataStore.use.expenses();
  const employees = useKhataStore.use.employees();
  const benefits = useKhataStore.use.benefits();

  useEffect(() => {
    if (!hydrated)
      void hydrate();
  }, [hydrate, hydrated]);
  useEffect(() => {
    if (lastRequestedSection.current !== requestedSection) {
      lastRequestedSection.current = requestedSection;
      history.current = [requestedSection];
      setSection(requestedSection);
    }
  }, [requestedSection]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && hydrated)
        void refresh();
    });
    return () => subscription.remove();
  }, [hydrated, refresh]);

  const navigate = useCallback((next: string) => {
    if (!nav.some(item => item.id === next))
      return;
    const nextSection = next as Section;
    if (history.current.at(-1) === nextSection)
      return;
    history.current = [...history.current, nextSection];
    setSection(nextSection);
  }, []);

  const goBack = useCallback(() => {
    if (history.current.length > 1) {
      history.current = history.current.slice(0, -1);
      setSection(history.current.at(-1) as Section);
      return true;
    }
    if (router.canGoBack()) {
      router.back();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android')
      return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack]);

  const content = section === 'dashboard'
    ? <DashboardScreen bills={bills} inventory={inventory} sales={sales} expenses={expenses} employees={employees} benefits={benefits} onNavigate={navigate} />
    : section === 'purchase-scan'
      ? <PurchasePanel onNavigate={navigate} />
      : section === 'sales-scan'
        ? <SalesInvoicePanel onNavigate={navigate} />
        : section === 'bills'
          ? <BillsPanel onNavigate={navigate} />
          : section === 'inventory'
            ? <InventoryPanel />
            : section === 'sales'
              ? <SalesPanel onNavigate={navigate} />
              : section === 'expenses'
                ? <ExpensesPanel />
                : section === 'employees'
                  ? <EmployeesPanel />
                  : section === 'reports'
                    ? <ReportsScreen onNavigate={navigate} />
                    : <SettingsScreen onNavigate={navigate} />;
  const workspaceContent = <WorkspaceScreenProvider section={section} refreshing={syncing} refresh={refresh} scrollOffset={scrollOffsets.current[section] || 0} onScrollOffsetChange={offset => updateScrollOffset(section, offset)}>{content}</WorkspaceScreenProvider>;

  return (
    <SafeAreaView style={styles.safe}>
      <FocusAwareStatusBar />
      <View style={styles.appFrame}>
        {desktop
          ? (
              <View style={styles.desktopRow}>
                <Sidebar active={section} onNavigate={navigate} company={company.name} />
                <View style={styles.desktopContent}>
                  {syncing && <SyncBanner text="Saving this workspace securely…" tone="pending" />}
                  {syncError && <SyncBanner text={syncError} tone="error" />}
                  {workspaceContent}
                </View>
              </View>
            )
          : (
              <>
                <MobileHeader active={section} onNavigate={navigate} onBack={goBack} company={company.name} />
                <View style={styles.mobileContent}>
                  {syncing && <SyncBanner text="Syncing securely…" tone="pending" />}
                  {syncError && <SyncBanner text={syncError} tone="error" />}
                  {workspaceContent}
                </View>
                <MobileNavigation active={section} onNavigate={navigate} />
              </>
            )}
      </View>
    </SafeAreaView>
  );
}

function SyncBanner({ text, tone }: { text: string; tone: 'pending' | 'error' }) { return <View style={[styles.syncBanner, tone === 'error' && styles.syncBannerError]}><Text style={styles.syncText}>{text}</Text></View>; }

function Brand({ compact = false, onPress }: { compact?: boolean; onPress?: () => void }) {
  const content = (
    <>
      <KhataLogo size={compact ? 34 : 42} />
      {!compact && (
        <View>
          <Text style={styles.brandName}>Khata</Text>
          <Text style={styles.brandSub}>Business, in balance.</Text>
        </View>
      )}
    </>
  );
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel="Go to Khata landing page" onPress={onPress} style={styles.brand}>{content}</Pressable> : <View style={styles.brand}>{content}</View>;
}

function Sidebar({ active, onNavigate, company }: { active: Section; onNavigate: (section: string) => void; company: string }) {
  return (
    <View style={styles.sidebar}>
      <Brand onPress={() => router.replace('/')} />
      <Pressable accessibilityRole="button" accessibilityLabel="Open company profile" onPress={() => router.push('/company')} style={({ pressed }) => [styles.companyChip, pressed && { opacity: 0.85 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{company}</Text>
          <Text style={styles.companyMeta}>NPR · Kathmandu</Text>
        </View>
        <ChevronRightIcon size={15} color="rgba(255,255,255,0.7)" />
      </Pressable>
      <View style={styles.nav}>{nav.map(item => <NavButton key={item.id} item={item} active={active === item.id} onPress={() => onNavigate(item.id)} />)}</View>
      <View style={styles.sidebarFooter}>
        <Text style={styles.footerText}>A clear book makes room for a better business.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={signOut} style={styles.footerLink}>
          <LogOutIcon size={15} color="#E4C077" />
          <Text style={styles.footerLinkText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NavButton({ item, active, onPress }: { item: (typeof nav)[number]; active: boolean; onPress: () => void }) {
  const Icon = item.icon;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.navButton, active && styles.navButtonActive, pressed && { opacity: 0.78 }]}>
      <View style={[styles.navIcon, active && styles.navIconActive]}><Icon size={16} color={active ? C.white : 'rgba(255,255,255,0.72)'} /></View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

function MobileHeader({ active, onNavigate, onBack, company }: { active: Section; onNavigate: (section: string) => void; onBack: () => boolean; company: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionLabel = nav.find(item => item.id === active)?.label || 'Overview';
  return (
    <View style={styles.mobileHeader}>
      {active !== 'dashboard' && <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}><ChevronLeftIcon size={20} color={C.ink} /></Pressable>}
      <Brand compact onPress={() => Platform.OS === 'web' ? router.replace('/') : onNavigate('dashboard')} />
      <View style={styles.mobileHeaderCopy}>
        <Text style={styles.mobileCompany} numberOfLines={1}>{company}</Text>
        <Text style={styles.mobileSection}>{sectionLabel}</Text>
      </View>
      <Pressable accessibilityLabel="Open workspace menu" onPress={() => setMenuOpen(true)} style={styles.switchButton}><GridIcon size={19} color={C.brick} /></Pressable>
      <CompanyMenu visible={menuOpen} onClose={() => setMenuOpen(false)} company={company} onNavigate={onNavigate} />
    </View>
  );
}

function CompanyMenu({ visible, onClose, company, onNavigate }: { visible: boolean; onClose: () => void; company: string; onNavigate: (section: string) => void }) {
  const items: Array<{ icon: typeof BuildingIcon; label: string; detail: string; onPress: () => void }> = [
    { icon: BuildingIcon, label: 'Company profile', detail: 'Business details and defaults', onPress: () => { onClose(); router.push('/company'); } },
    { icon: FileTextIcon, label: 'Reports', detail: 'Day book, profit and stock', onPress: () => { onClose(); onNavigate('reports'); } },
    { icon: GearIcon, label: 'Settings', detail: 'Business details and sync', onPress: () => { onClose(); onNavigate('settings'); } },
    { icon: LogOutIcon, label: 'Sign out', detail: 'End this session on this device', onPress: async () => { onClose(); await signOut(); } },
  ];
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menuCard} onPress={() => {}}>
          <View style={styles.menuHead}>
            <KhataLogo size={34} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle} numberOfLines={1}>{company}</Text>
              <Text style={styles.menuDetail}>Current workspace · NPR</Text>
            </View>
            <CheckIcon size={16} color={C.green} />
          </View>
          {items.map((item) => {
            const Icon = item.icon; return (
              <Pressable accessibilityRole="button" accessibilityLabel={item.label} key={item.label} onPress={item.onPress} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.75 }]}>
                <View style={styles.menuIconBox}><Icon size={17} color={C.brick} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Text style={styles.menuItemDetail}>{item.detail}</Text>
                </View>
                <ChevronRightIcon size={16} color={C.muted} />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MobileNavigation({ active, onNavigate }: { active: Section; onNavigate: (section: string) => void }) {
  return (
    <View style={styles.mobileNav}>
      {mobileNav.map((item) => {
        const Icon = item.icon; return (
          <Pressable accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: active === item.id }} key={item.id} onPress={() => onNavigate(item.id)} style={({ pressed }) => [styles.mobileNavItem, pressed && { opacity: 0.7 }]}>
            <View style={[styles.mobileNavIcon, active === item.id && styles.mobileNavIconActive]}><Icon size={19} color={active === item.id ? C.brick : C.muted} /></View>
            <Text style={[styles.mobileNavLabel, active === item.id && styles.mobileNavLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

async function signOut() { await useAuth.getState().signOut(); router.replace('/login'); }

export default WorkspaceScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  appFrame: { flex: 1, width: '100%', minWidth: 0 },
  desktopRow: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 246, backgroundColor: C.brickDark, paddingHorizontal: 12, paddingTop: 22, paddingBottom: 18, gap: 14, overflow: 'hidden' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  brandName: { color: C.white, fontSize: 22, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.3 },
  brandSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 },
  companyChip: { marginHorizontal: 4, padding: 12, borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  companyName: { color: C.white, fontWeight: '800', fontSize: 13 },
  companyMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 },
  nav: { flex: 1, gap: 3 },
  navButton: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 10 },
  navButtonActive: { backgroundColor: 'rgba(255,255,255,0.13)' },
  navIcon: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  navIconActive: { backgroundColor: 'rgba(255,255,255,0.21)' },
  navLabel: { color: 'rgba(255,255,255,0.76)', fontSize: 13, flex: 1 },
  navLabelActive: { color: C.white, fontWeight: '800' },
  sidebarFooter: { borderTopColor: 'rgba(255,255,255,0.14)', borderTopWidth: 1, paddingTop: 14, gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  footerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footerLinkText: { color: '#E4C077', textAlign: 'center', fontSize: 12, fontWeight: '800' },
  desktopContent: { flex: 1, minWidth: 0, width: '100%', overflow: 'hidden', backgroundColor: C.cream },
  syncBanner: { backgroundColor: C.greenLight, borderBottomColor: '#C5D6BA', borderBottomWidth: 1, paddingHorizontal: 18, paddingVertical: 7 },
  syncBannerError: { backgroundColor: C.redLight, borderBottomColor: '#DFB4A4' },
  syncText: { color: C.greenDark, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  mobileHeader: { width: '100%', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.paperLight, borderBottomColor: C.border, borderBottomWidth: 1 },
  backButton: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream, borderColor: C.border, borderWidth: 1 },
  mobileHeaderCopy: { flex: 1, minWidth: 0 },
  mobileCompany: { color: C.ink, fontWeight: '800', fontSize: 13 },
  mobileSection: { color: C.muted, fontSize: 10, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  switchButton: { width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: C.redLight, borderColor: '#E3B9AA', borderWidth: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(44,33,21,0.42)', justifyContent: 'flex-start', paddingTop: 74, paddingHorizontal: 20 },
  menuCard: { backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 10, padding: 8, gap: 4, width: '100%', maxWidth: 420, alignSelf: 'center' },
  menuHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomColor: C.border, borderBottomWidth: 1, marginBottom: 4 },
  menuTitle: { color: C.ink, fontWeight: '800', fontSize: 15 },
  menuDetail: { color: C.muted, fontSize: 11, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 7 },
  menuIconBox: { width: 34, height: 34, borderRadius: 7, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { color: C.ink, fontWeight: '700', fontSize: 14 },
  menuItemDetail: { color: C.muted, fontSize: 11, marginTop: 2 },
  mobileContent: { flex: 1, width: '100%', minWidth: 0, overflow: 'hidden', backgroundColor: C.cream },
  mobileNav: { width: '100%', minWidth: 0, flexDirection: 'row', backgroundColor: C.paperLight, borderTopColor: C.border, borderTopWidth: 1, paddingBottom: 7, paddingTop: 7 },
  mobileNavItem: { flex: 1, alignItems: 'center', gap: 3, minHeight: 45 },
  mobileNavIcon: { width: 30, height: 27, alignItems: 'center', justifyContent: 'center' },
  mobileNavIconActive: { borderBottomColor: C.brick, borderBottomWidth: 2 },
  mobileNavLabel: { color: C.muted, fontSize: 10, fontWeight: '700' },
  mobileNavLabelActive: { color: C.brick, fontWeight: '800' },
});
