import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { Button, Card, C, Chip, Screen, Text, Title } from '@/features/khata/ui';
import { useKhataStore } from '@/features/khata/store';

const items = [['🏪', 'Business profile', 'PAN, contact details and company defaults'], ['👥', 'Team & permissions', 'Members, invitations and roles'], ['🔄', 'Sync & offline data', 'Queued changes and last sync status'], ['📅', 'Fiscal year', 'BS 2082/83 · Kathmandu timezone'], ['🌐', 'Language & appearance', 'Nepali, English and theme preferences']];

export function SettingsScreen() {
  const signOut = useAuth.use.signOut();
  const company = useKhataStore.use.company();
  return <Screen><View style={styles.top}><Title subtitle="Manage your business and Khata preferences">Settings</Title><Chip tone="green">Local-first</Chip></View><Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{company.name.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{company.name}</Text><Text style={styles.meta}>{company.businessType} · {company.currency} · {company.city}</Text></View><Button label="Switch" variant="outline" onPress={() => router.replace('/company')} /></Card>{items.map(([icon, title, detail]) => <Pressable key={title} onPress={() => {}} style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}><Text style={styles.icon}>{icon}</Text><View style={{ flex: 1 }}><Text style={styles.itemTitle}>{title}</Text><Text style={styles.itemDetail}>{detail}</Text></View><Text style={styles.manage}>Manage →</Text></Pressable>)}<Card style={styles.signOut}><Text style={styles.itemTitle}>Sign out</Text><Text style={styles.itemDetail}>End this session on this device</Text><Button label="Sign out" variant="danger" onPress={signOut} /></Card><Button label="Back to workspace" variant="ghost" onPress={() => router.replace('/')} /></Screen>;
}
export default SettingsScreen;

const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, profile: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.brick, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.white, fontWeight: '800', fontSize: 20 }, name: { color: C.ink, fontWeight: '800', fontSize: 16 }, meta: { color: C.muted, fontSize: 12, marginTop: 4 }, item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 15 }, icon: { fontSize: 24 }, itemTitle: { color: C.ink, fontWeight: '800' }, itemDetail: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }, manage: { color: C.greenDark, fontSize: 12, fontWeight: '800' }, signOut: { backgroundColor: C.redLight, borderColor: '#E8C4B4' },
});
