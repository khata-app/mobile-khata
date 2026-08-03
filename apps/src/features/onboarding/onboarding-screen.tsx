import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useIsFirstTime } from '@/lib/hooks';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { Button, C, Chip } from '@/features/khata/ui';

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return <View style={styles.safe}><FocusAwareStatusBar /><View style={styles.watermark}><Text style={styles.watermarkText}>⌂</Text></View><View style={styles.content}><Chip tone="gold">Nepal SME accounting workspace</Chip><View style={styles.logo}><Text style={styles.logoText}>⌂</Text></View><Text style={styles.title}>Namaste, Khata 👋</Text><Text style={styles.subtitle}>A calmer way to run your business, from the first sale to the year-end report.</Text><View style={styles.featureList}>{[['📒', 'Sales, purchases and expenses in one place'], ['📊', 'Know your cash, profit and stock at a glance'], ['🔒', 'Your business data stays private and secure'], ['⚡', 'Works offline and syncs when you reconnect']].map(([icon, label]) => <View key={label} style={styles.feature}><Text style={styles.featureIcon}>{icon}</Text><Text style={styles.featureText}>{label}</Text></View>)}</View><View style={styles.bottom}><Button label="Get started with Khata" onPress={() => { setIsFirstTime(false); router.replace('/login'); }} /><Pressable onPress={() => { setIsFirstTime(false); router.replace('/login'); }}><Text style={styles.existing}>Already have an account? Log in</Text></Pressable></View></View></View>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, content: { width: '100%', maxWidth: 520, padding: 28, alignItems: 'center', gap: 14, zIndex: 1 }, watermark: { position: 'absolute', right: -60, top: -35, opacity: 0.06 }, watermarkText: { color: C.brick, fontSize: 300, fontWeight: '800' }, logo: { width: 78, height: 78, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: C.brick, marginTop: 12, shadowColor: C.brickDark, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 }, logoText: { color: C.white, fontSize: 48, fontWeight: '800' }, title: { color: C.ink, fontSize: 34, fontWeight: '800', textAlign: 'center', marginTop: 6 }, subtitle: { color: C.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 430 }, featureList: { width: '100%', marginTop: 10, gap: 8 }, feature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,.75)', borderColor: C.border, borderWidth: 1, padding: 13, borderRadius: 14 }, featureIcon: { fontSize: 20 }, featureText: { color: C.ink, fontSize: 13, fontWeight: '600', flex: 1 }, bottom: { width: '100%', alignItems: 'center', gap: 10, marginTop: 10 }, existing: { color: C.brick, fontSize: 12, fontWeight: '700' },
});
