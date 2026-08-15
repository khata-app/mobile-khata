import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { BuildingIcon, CalendarIcon, ChevronRightIcon, LogOutIcon, RefreshIcon, UsersIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Field, Screen, SERIF, Text, Title } from '@/features/khata/ui';
import { defaultTaxRates, type TaxRate } from '@/features/tax/domain';
import { exportWorkspaceBackup, listAuditEvents, listTaxRates, listWorkspaceMembers, migrateLegacyRecordsToLedger, upsertTaxRate, type AuditEvent, type WorkspaceMember } from '@/lib/supabase-repository';

export function SettingsScreen({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const signOut = useAuth.use.signOut();
  const company = useKhataStore.use.company();
  const businessId = useKhataStore.use.businessId();
  const refresh = useKhataStore.use.refresh();
  const syncing = useKhataStore.use.syncing();
  const [notice, setNotice] = useState('');
  const [taxRates, setTaxRates] = useState<TaxRate[]>(defaultTaxRates);
  const [taxNotice, setTaxNotice] = useState('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [adminNotice, setAdminNotice] = useState('');
  useEffect(() => {
    if (!businessId) return;
    void listTaxRates(businessId).then(rates => { if (rates.length) setTaxRates(rates); }).catch(() => setTaxNotice('Tax defaults are available locally; sync them when Supabase is ready.'));
  }, [businessId]);
  useEffect(() => {
    if (!businessId) return;
    void Promise.all([listWorkspaceMembers(businessId), listAuditEvents(businessId)]).then(([nextMembers, nextAudit]) => { setMembers(nextMembers); setAuditEvents(nextAudit); }).catch(() => setAdminNotice('Members and audit history will appear after the admin migration is applied.'));
  }, [businessId]);
  const runRefresh = async () => { setNotice('Checking Supabase for the latest workspace data…'); await refresh(); setNotice('Workspace is up to date.'); };
  const leave = async () => { await signOut(); router.replace('/login'); };
  const updateTaxRate = (index: number, value: string) => setTaxRates(current => current.map((rate, rateIndex) => rateIndex === index ? { ...rate, rate: Number(value) || 0 } : rate));
  const saveTaxRates = async () => {
    if (!businessId) { setTaxNotice('Tax defaults updated for this session.'); return; }
    try { setTaxNotice('Saving tax rates…'); await Promise.all(taxRates.map(rate => upsertTaxRate(businessId, rate))); setTaxNotice('Tax rates saved securely.'); }
    catch (error) { setTaxNotice(error instanceof Error ? error.message : 'Tax rates could not be saved.'); }
  };
  const exportBackup = async () => {
    if (!businessId) { setAdminNotice('Create a connected workspace before exporting a backup.'); return; }
    try {
      setAdminNotice('Preparing a private workspace backup…');
      const snapshot = await exportWorkspaceBackup(businessId);
      const json = JSON.stringify(snapshot, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${company.name.replaceAll(' ', '-').toLowerCase()}-backup.json`; anchor.click(); URL.revokeObjectURL(url);
      }
      else {
        const uri = `${FileSystem.cacheDirectory}khata-backup-${Date.now()}.json`;
        await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Export Khata backup' });
      }
      setAdminNotice('Backup exported. Keep it somewhere private and secure.');
    }
    catch (error) { setAdminNotice(error instanceof Error ? error.message : 'Backup could not be exported.'); }
  };
  const migrateLedger = async () => {
    if (!businessId) { setAdminNotice('Create a connected workspace before migrating ledger records.'); return; }
    try { setAdminNotice('Checking legacy records and posting missing ledger entries…'); const count = await migrateLegacyRecordsToLedger(businessId); setAdminNotice(`${count} legacy record${count === 1 ? '' : 's'} migrated. Existing ledger entries were left untouched.`); }
    catch (error) { setAdminNotice(error instanceof Error ? error.message : 'Legacy records could not be migrated.'); }
  };
  const items = [
    { icon: BuildingIcon, title: 'Business profile', detail: 'PAN, city and company defaults', onPress: () => router.replace('/company') },
    { icon: UsersIcon, title: 'Team & permissions', detail: 'Manage employees and benefits', onPress: () => onNavigate ? onNavigate('employees') : router.replace('/dashboard?section=employees') },
    { icon: CalendarIcon, title: 'Reports & fiscal year', detail: 'Review performance and period totals', onPress: () => onNavigate ? onNavigate('reports') : router.replace('/reports') },
  ];
  return (
    <Screen>
      <View style={styles.top}>
        <Title subtitle="Manage your business and keep this device up to date.">Settings</Title>
        <Chip tone="green">English · Light</Chip>
      </View>
      <Card style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{company.name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{company.name}</Text>
          <Text style={styles.meta}>
            {company.businessType}
            {' '}
            ·
            {' '}
            {company.currency}
            {' '}
            ·
            {' '}
            {company.city || 'Kathmandu'}
          </Text>
        </View>
        <Button label="Open" variant="outline" onPress={() => router.replace('/company')} />
      </Card>
      {items.map(item => (
        <Pressable key={item.title} onPress={item.onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.74 }]}>
          <View style={styles.iconBox}><item.icon size={19} color={C.brick} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDetail}>{item.detail}</Text>
          </View>
          <ChevronRightIcon size={17} color={C.muted} />
        </Pressable>
      ))}
      <Card>
        <Text style={styles.itemTitle}>Tax master</Text>
        <Text style={styles.itemDetail}>Set the VAT and TDS rates used by purchases, expenses and reports.</Text>
        {taxRates.map((rate, index) => <View style={styles.taxRow} key={rate.code}><View style={{ flex: 1 }}><Text style={styles.taxName}>{rate.name}</Text><Text style={styles.taxCode}>{rate.code} · {rate.kind.toUpperCase()}</Text></View><Field label="Rate %" value={String(rate.rate)} onChangeText={value => updateTaxRate(index, value)} keyboardType="numeric" /></View>)}
        <Button label="Save tax rates" variant="outline" onPress={() => { void saveTaxRates(); }} />
        {taxNotice && <Text style={styles.notice}>{taxNotice}</Text>}
      </Card>
      <Card>
        <Text style={styles.itemTitle}>Users, roles and audit</Text>
        <Text style={styles.itemDetail}>See who can access this workspace and the latest recorded admin events.</Text>
        {members.length ? members.map(member => <View style={styles.adminRow} key={member.userId}><Text style={styles.adminName}>{member.name}</Text><Chip tone={member.role === 'owner' ? 'gold' : 'green'}>{member.role}</Chip></View>) : <Text style={styles.itemDetail}>No member list loaded yet.</Text>}
        {auditEvents.length > 0 && <><Text style={styles.auditHeading}>Recent activity</Text>{auditEvents.slice(0, 5).map(event => <Text style={styles.auditLine} key={event.id}>{event.action} · {event.entityType || 'workspace'} · {new Date(event.createdAt).toLocaleDateString()}</Text>)}</>}
        <Button label="Export backup" variant="outline" onPress={() => { void exportBackup(); }} />
        <Button label="Migrate old records to ledger" variant="outline" onPress={() => { void migrateLedger(); }} />
        {adminNotice && <Text style={styles.notice}>{adminNotice}</Text>}
      </Card>
      <Card style={styles.syncCard}>
        <View style={styles.syncCopy}>
          <Text style={styles.itemTitle}>Sync and offline data</Text>
          <Text style={styles.itemDetail}>Refresh this device from your workspace. Changes stay visible on this device if the connection drops.</Text>
        </View>
        <Button label={syncing ? 'Syncing…' : 'Sync now'} variant="outline" icon={<RefreshIcon size={15} color={C.brick} />} onPress={runRefresh} disabled={syncing} />
        {notice && <Text style={styles.notice}>{notice}</Text>}
      </Card>
      <Card style={styles.signOut}>
        <Text style={styles.itemTitle}>Sign out</Text>
        <Text style={styles.itemDetail}>End this session on this device.</Text>
        <Button label="Sign out" variant="danger" icon={<LogOutIcon size={15} color={C.red} />} onPress={leave} />
      </Card>
    </Screen>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 8, backgroundColor: C.brick, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontWeight: '800', fontSize: 20, fontFamily: SERIF },
  name: { color: C.ink, fontWeight: '800', fontSize: 16 },
  meta: { color: C.muted, fontSize: 12, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 8, padding: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 7, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { color: C.ink, fontWeight: '800' },
  itemDetail: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  syncCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  syncCopy: { flex: 1, minWidth: 220 },
  notice: { width: '100%', color: C.greenDark, fontSize: 12, fontWeight: '700' },
  taxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderBottomColor: C.border, borderBottomWidth: 1 },
  taxName: { color: C.ink, fontSize: 13, fontWeight: '800' },
  taxCode: { color: C.muted, fontSize: 10, marginTop: 3 },
  adminRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 8, borderBottomColor: C.border, borderBottomWidth: 1 },
  adminName: { flex: 1, color: C.ink, fontSize: 13, fontWeight: '700' },
  auditHeading: { color: C.ink, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginTop: 8 },
  auditLine: { color: C.muted, fontSize: 11, lineHeight: 17 },
  signOut: { backgroundColor: C.redLight, borderColor: '#DFB4A4' },
});
