import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { BuildingIcon, CalendarIcon, ChevronRightIcon, LogOutIcon, RefreshIcon, UsersIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Screen, SERIF, Text, Title } from '@/features/khata/ui';

export function SettingsScreen({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const signOut = useAuth.use.signOut();
  const company = useKhataStore.use.company();
  const refresh = useKhataStore.use.refresh();
  const syncing = useKhataStore.use.syncing();
  const [notice, setNotice] = useState('');
  const runRefresh = async () => { setNotice('Checking Supabase for the latest workspace data…'); await refresh(); setNotice('Workspace is up to date.'); };
  const leave = async () => { await signOut(); router.replace('/login'); };
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
  signOut: { backgroundColor: C.redLight, borderColor: '#DFB4A4' },
});
