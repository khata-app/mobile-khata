import { useRouter } from 'expo-router';
import * as React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFirstTime } from '@/lib/hooks';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { Button, C, SERIF, ruledPaper } from '@/features/khata/ui';
import { BarChartIcon, BookIcon, KhataMark, LockIcon, ZapIcon } from '@/features/khata/icons';

const features = [
  { icon: BookIcon, label: 'Sales, purchases and expenses in one place' },
  { icon: BarChartIcon, label: 'Know your cash, profit and stock at a glance' },
  { icon: LockIcon, label: 'Your business data stays private and secure' },
  { icon: ZapIcon, label: 'Works offline and syncs when you reconnect' },
];

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const start = () => { setIsFirstTime(false); router.replace('/login'); };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ImageBackground source={require('../../../assets/backgrounds/himalayan-paper.webp')} imageStyle={styles.backgroundImage} style={[styles.safe, ruledPaper]}>
          <FocusAwareStatusBar />
          <View style={styles.watermark} pointerEvents="none">
            <KhataMark size={320} color={C.brick} />
          </View>
          <View style={styles.content}>
            <View style={styles.logo}>
              <KhataMark size={34} color={C.white} />
            </View>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>Nepal SME accounting workspace</Text>
            </View>
            <Text style={styles.title}>Namaste, Khata</Text>
            <Text style={styles.subtitle}>A calmer way to run your business, from the first sale to the year-end report.</Text>
            <View style={styles.featureList}>
              {features.map(feature => (
                <View key={feature.label} style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <feature.icon size={18} color={C.brick} />
                  </View>
                  <Text style={styles.featureText}>{feature.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.bottom}>
              <Button label="Get started with Khata" onPress={start} />
              <Pressable onPress={start} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={styles.existing}>Already have an account? Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  scroll: { flexGrow: 1 },
  safe: { flex: 1, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  backgroundImage: { opacity: 0.18, resizeMode: 'cover' },
  watermark: { position: 'absolute', right: -40, top: -60, opacity: 0.05 },
  content: { width: '100%', maxWidth: 520, padding: 28, alignItems: 'center', gap: 14, zIndex: 1 },
  logo: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: C.brick, marginTop: 12, shadowColor: C.brickDark, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  eyebrow: { backgroundColor: C.yellowLight, borderColor: '#E0C88F', borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  eyebrowText: { color: C.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: C.ink, fontSize: 36, fontWeight: '800', fontFamily: SERIF, textAlign: 'center', marginTop: 8, letterSpacing: -0.5 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 430 },
  featureList: { width: '100%', marginTop: 10, gap: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(253,248,238,0.85)', borderColor: C.border, borderWidth: 1, padding: 13, borderRadius: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center' },
  featureText: { color: C.ink, fontSize: 13, fontWeight: '700', flex: 1 },
  bottom: { width: '100%', alignItems: 'center', gap: 10, marginTop: 10 },
  existing: { color: C.brick, fontSize: 13, fontWeight: '800' },
});
