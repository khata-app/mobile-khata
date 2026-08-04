import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { Button, Card, C, Chip, Screen, SERIF, Text, Title } from '@/features/khata/ui';
import { BuildingIcon, CalendarIcon, ChevronRightIcon, GlobeIcon, LogOutIcon, RefreshIcon, UsersIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';

const items = [
  { icon: BuildingIcon, title: 'Business profile', detail: 'PAN, contact details and company defaults' },
  { icon: UsersIcon, title: 'Team & permissions', detail: 'Members, invitations and roles' },
  { icon: RefreshIcon, title: 'Sync & offline data', detail: 'Queued changes and last sync status' },
  { icon: CalendarIcon, title: 'Fiscal year', detail: 'BS 2082/83 · Kathmandu timezone' },
  { icon: GlobeIcon, title: 'Language & appearance', detail: 'Nepali, English and theme preferences' },
];

export function SettingsScreen() {
  const signOut = useAuth.use.signOut();
  const company = useKhataStore.use.company();
  return <Screen><View style={styles.top}><Title subtitle="Manage your business and Khata preferences">Settings</Title><Chip tone="green">Local-first</Chip></View><Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{company.name.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{company.name}</Text><Text style={styles.meta}>{company.businessType} · {company.currency} · {company.city}</Text></View><Button label="Switch" variant="outline" onPress={() => router.replace('/company')} /></Card>{items.map(item => <Pressable key={item.title} onPress={() => {}} style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}><View style={styles.iconBox}><item.icon size={20} color={C.brick} /></View><View style={{ flex: 1 }}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemDetail}>{item.detail}</Text></View><ChevronRightIcon size={18} color={C.muted} /></Pressable>)}<Card style={styles.signOut}><Text style={styles.itemTitle}>Sign out</Text><Text style={styles.itemDetail}>End this session on this device</Text><Button label="Sign out" variant="danger" icon={<LogOutIcon size={15} color={C.red} />} onPress={signOut} /></Card><Button label="Back to workspace" variant="ghost" onPress={() => router.replace('/')} /></Screen>;
}
export default SettingsScreen;

const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, profile: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.brick, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.white, fontWeight: '800', fontSize: 20, fontFamily: SERIF }, name: { color: C.ink, fontWeight: '800', fontSize: 16 }, meta: { color: C.muted, fontSize: 12, marginTop: 4 }, item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(253,248,238,0.85)', borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 15 }, iconBox: { width: 40, height: 40, borderRadius: 11, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' }, itemTitle: { color: C.ink, fontWeight: '800' }, itemDetail: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }, signOut: { backgroundColor: C.redLight, borderColor: '#DFB4A4' },
});
