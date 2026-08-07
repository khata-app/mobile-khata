import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BackButton, C, Screen, SERIF, Text, Title } from '@/features/khata/ui';

export function PrivacyScreen() {
  return <Screen><BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /><Title subtitle="A clear promise for the people who trust us with their books.">Privacy at Khata</Title><View style={styles.card}><Text style={styles.heading}>Your business belongs to you.</Text><Text style={styles.body}>Khata keeps each company in its own Supabase workspace. Database access is protected with row-level security, and the mobile app only uses the publishable Supabase key. We never put service-role credentials in the app.</Text><Text style={styles.heading}>What we store</Text><Text style={styles.body}>Workspace settings, sales, purchases, expenses, inventory, team records and the bill documents you choose to upload. Offline data stays on the device until it can sync securely.</Text><Text style={styles.heading}>Your control</Text><Text style={styles.body}>You can sign out, update business details, and ask for an export or deletion by contacting hello@khata.app.</Text></View></Screen>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 8, padding: 20, gap: 10, maxWidth: 780 },
  heading: { color: C.ink, fontSize: 21, fontWeight: '800', fontFamily: SERIF, marginTop: 8 },
  body: { color: C.muted, fontSize: 14, lineHeight: 23 },
});

export default PrivacyScreen;
