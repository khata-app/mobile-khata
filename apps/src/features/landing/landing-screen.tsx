import { router } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { KhataLogo } from '@/features/khata/brand';

const L = {
  ink: '#080B14',
  inkSoft: '#111827',
  bone: '#F4EFE5',
  paper: '#FFFDF8',
  orange: '#FF633C',
  blue: '#3156FF',
  acid: '#C8FF3D',
  lilac: '#B9B6FF',
  muted: '#AAB3C5',
  darkMuted: '#5E6778',
  line: 'rgba(8, 11, 20, 0.13)',
};

const heroWeb = require('../../../assets/landing/hero-web-v2.jpg');
const heroMobile = require('../../../assets/landing/hero-mobile-v2.jpg');
const inkTexture = require('../../../assets/landing/ink-texture-v2.jpg');
const teamImage = require('../../../assets/landing/nepali-team-v2.jpg');

function ActionButton({ label, onPress, tone = 'orange', compact = false }: { label: string; onPress: () => void; tone?: 'orange' | 'blue' | 'light'; compact?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionButton, compact && styles.actionButtonCompact, tone === 'blue' && styles.actionBlue, tone === 'light' && styles.actionLight, pressed && styles.actionPressed]}>
    <Text style={[styles.actionLabel, tone === 'light' && styles.actionLabelLight]}>{label}</Text>
    <Text style={[styles.actionArrow, tone === 'light' && styles.actionLabelLight]}>↗</Text>
  </Pressable>;
}

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: object }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => Animated.spring(progress, { toValue: 1, damping: 18, stiffness: 90, mass: 0.8, useNativeDriver: true }).start(), delay);
    return () => clearTimeout(timer);
  }, [delay, progress]);
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}>{children}</Animated.View>;
}

export function LandingScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const narrow = width < 470;
  const heroImage = compact ? heroMobile : heroWeb;

  return <SafeAreaView style={styles.safe}><FocusAwareStatusBar /><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
    <View style={styles.shell}>
      <View style={[styles.navbar, compact && styles.navbarCompact]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go to Khata home" onPress={() => router.replace('/')} style={styles.brand}>
          <KhataLogo size={compact ? 38 : 44} />
          <View><Text style={styles.brandName}>Khata</Text><Text style={styles.brandDetail}>The business book, reimagined.</Text></View>
        </Pressable>
        <View style={styles.navLinks}>
          {!compact && <><Pressable onPress={() => router.push('/about')}><Text style={styles.navLink}>About</Text></Pressable><Pressable onPress={() => router.push('/privacy')}><Text style={styles.navLink}>Privacy</Text></Pressable></>}
          <ActionButton label="Sign in" tone="light" compact={compact} onPress={() => router.push('/login')} />
        </View>
      </View>

      <View style={[styles.hero, compact && styles.heroCompact]}>
        <View style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
          <Reveal><View style={styles.eyebrow}><View style={styles.liveDot} /><Text style={styles.eyebrowText}>A new rhythm for small business</Text></View></Reveal>
          <Reveal delay={80}><Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>Your business has a pulse.<Text style={styles.heroTitleAccent}> Keep up with it.</Text></Text></Reveal>
          <Reveal delay={150}><Text style={styles.heroMotto}>Digitalizing small and medium scale businesses.</Text></Reveal>
          <Reveal delay={220}><Text style={styles.heroText}>Khata turns the daily rush into one clear picture — sales, stock, cash and the next smart move, all in one beautifully simple workspace.</Text></Reveal>
          <Reveal delay={290}><View style={[styles.heroActions, narrow && styles.heroActionsNarrow]}><ActionButton label="Open your workspace" onPress={() => router.push('/login')} /><Pressable onPress={() => router.push('/about')} style={styles.storyLink}><Text style={styles.storyLinkText}>See the story</Text><Text style={styles.storyArrow}>↓</Text></Pressable></View></Reveal>
          <Reveal delay={360}><View style={styles.proofRow}><View><Text style={styles.proofNumber}>01</Text><Text style={styles.proofLabel}>simple daily view</Text></View><View><Text style={styles.proofNumber}>NPR</Text><Text style={styles.proofLabel}>made for local work</Text></View><View><Text style={styles.proofNumber}>RLS</Text><Text style={styles.proofLabel}>private by design</Text></View></View></Reveal>
        </View>
        <Reveal delay={170} style={[styles.heroVisual, compact && styles.heroVisualCompact]}><ImageBackground source={heroImage} resizeMode="cover" imageStyle={styles.heroImage} style={styles.heroImageFrame}>
          <View style={styles.heroVisualTop}><Text style={styles.visualTag}>KHATA / 01</Text><Text style={styles.visualTag}>LIVE PICTURE</Text></View>
          <View style={styles.visualBottom}><View style={styles.visualOrb}><Text style={styles.visualOrbText}>↗</Text></View><View style={styles.visualWords}><Text style={styles.visualTitle}>Less paper.</Text><Text style={styles.visualTitle}>More momentum.</Text><Text style={styles.visualCaption}>The calm behind every good counter.</Text></View></View>
        </ImageBackground></Reveal>
      </View>

      <Reveal delay={120} style={styles.marquee}><Text style={styles.marqueeText}>SELL WITH CLARITY</Text><Text style={styles.marqueeMark}>✳</Text><Text style={styles.marqueeText}>BUY WITH CONFIDENCE</Text><Text style={styles.marqueeMark}>✳</Text><Text style={styles.marqueeText}>GROW WITH A CLEARER BOOK</Text></Reveal>

      <View style={styles.storySection}>
        <Reveal><View style={styles.sectionHeading}><Text style={styles.sectionIndex}>[ 02 / THE EVERYDAY ]</Text><Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>The busy day, finally making sense.</Text><Text style={styles.sectionIntro}>From the first sale to the last stock check, Khata gives the whole team a shared view of what matters now.</Text></View></Reveal>
        <View style={[styles.featureGrid, compact && styles.featureGridCompact]}>
          <Reveal delay={80} style={styles.featureCardWrap}><View style={[styles.featureCard, styles.featureOrange]}><Text style={styles.featureNumber}>01</Text><Text style={styles.featureTitle}>Sell in the flow.</Text><Text style={styles.featureText}>Record sales in seconds and keep the counter moving. No maze of screens, no lost slips.</Text><View style={styles.featureFooter}><Text style={styles.featureMeta}>SALES / CASH / CREDIT</Text><Text style={styles.featureIcon}>↗</Text></View></View></Reveal>
          <Reveal delay={150} style={styles.featureCardWrap}><View style={[styles.featureCard, styles.featureBlue]}><Text style={styles.featureNumber}>02</Text><Text style={styles.featureTitle}>See your stock thinking.</Text><Text style={styles.featureText}>Know what is moving, what is low and where your money is sitting before it surprises you.</Text><View style={styles.featureFooter}><Text style={styles.featureMeta}>STOCK / PURCHASES</Text><Text style={styles.featureIcon}>◌</Text></View></View></Reveal>
          <Reveal delay={220} style={styles.featureCardWrap}><View style={[styles.featureCard, styles.featureAcid]}><Text style={[styles.featureNumber, styles.featureDarkText]}>03</Text><Text style={[styles.featureTitle, styles.featureDarkText]}>Make the next call.</Text><Text style={[styles.featureText, styles.featureDarkText]}>Reports that feel like a useful answer, not a pile of numbers. Built for owners and their teams.</Text><View style={[styles.featureFooter, styles.featureBorderDark]}><Text style={[styles.featureMeta, styles.featureDarkText]}>REPORTS / PROFIT / VAT</Text><Text style={[styles.featureIcon, styles.featureDarkText]}>⌁</Text></View></View></Reveal>
        </View>
      </View>

      <ImageBackground source={inkTexture} resizeMode="cover" imageStyle={styles.textureImage} style={[styles.textureBand, compact && styles.textureBandCompact]}>
        <View style={styles.textureOverlay} />
        <Reveal><View style={styles.textureCopy}><Text style={styles.sectionIndexLight}>[ 03 / MADE FOR REAL PEOPLE ]</Text><Text style={[styles.textureTitle, compact && styles.textureTitleCompact]}>A good book should feel like a good day.</Text><Text style={styles.textureText}>Not louder. Not more complicated. Just ready when you are — at the shop, in the café, on the road or around the family table.</Text></View></Reveal>
        <Reveal delay={130}><View style={styles.note}><Text style={styles.noteSmall}>TODAY'S NOTE</Text><Text style={styles.noteBig}>Keep the good work visible.</Text><Text style={styles.noteLine}>— Khata</Text></View></Reveal>
      </ImageBackground>

      <View style={[styles.peopleSection, compact && styles.peopleSectionCompact]}>
        <Reveal style={[styles.peopleImageWrap, compact && styles.peopleImageWrapCompact]}><Image source={teamImage} resizeMode="cover" style={styles.peopleImage} /><View style={styles.peopleStamp}><Text style={styles.peopleStampText}>BUILT FOR</Text><Text style={styles.peopleStampText}>THE NEXT GENERATION</Text></View></Reveal>
        <Reveal delay={120} style={styles.peopleCopy}><Text style={styles.sectionIndex}>[ 04 / OUR WHY ]</Text><Text style={[styles.peopleTitle, compact && styles.peopleTitleCompact]}>The people behind the counter know the most.</Text><Text style={styles.sectionIntro}>Khata is for the builders who remember every customer, every supplier and every hard-won rupee. We make the numbers easier to see so the human work can lead.</Text><ActionButton label="Meet the team" tone="blue" onPress={() => router.push('/about')} /></Reveal>
      </View>

      <View style={styles.finalCta}><View style={styles.finalCtaCircle}><Text style={styles.finalCtaCircleText}>खाता</Text></View><Text style={styles.finalEyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text><Text style={[styles.finalTitle, compact && styles.finalTitleCompact]}>Make room for better business.</Text><Text style={styles.finalText}>Open your Khata today and bring a little more clarity to every decision.</Text><ActionButton label="Start with Khata" onPress={() => router.push('/login')} /></View>

      <View style={styles.footer}><View style={styles.footerBrand}><KhataLogo size={34} /><View><Text style={styles.footerName}>Khata</Text><Text style={styles.footerTagline}>Digitalizing small and medium scale businesses.</Text></View></View><View style={styles.footerLinks}><Pressable onPress={() => router.push('/about')}><Text style={styles.footerLink}>About us</Text></Pressable><Pressable onPress={() => router.push('/privacy')}><Text style={styles.footerLink}>Privacy</Text></Pressable><Text style={styles.footerMeta}>hello@khata.app</Text></View><Text style={styles.footerCopyright}>© 2026 Khata. Keep building.</Text></View>
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: L.ink },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  shell: { width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 22, backgroundColor: L.ink },
  navbar: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, borderBottomColor: 'rgba(255,255,255,0.14)', borderBottomWidth: 1 },
  navbarCompact: { minHeight: 68 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: L.paper, fontSize: 24, fontWeight: '900', letterSpacing: -0.7 },
  brandDetail: { color: L.muted, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 23 },
  navLink: { color: L.muted, fontSize: 13, fontWeight: '800' },
  actionButton: { minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, backgroundColor: L.orange, borderRadius: 2 },
  actionButtonCompact: { minHeight: 43, paddingHorizontal: 13, gap: 12 },
  actionBlue: { backgroundColor: L.blue },
  actionLight: { minHeight: 40, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.4)', borderWidth: 1 },
  actionPressed: { opacity: 0.76, transform: [{ translateY: 1 }] },
  actionLabel: { color: L.ink, fontSize: 12, fontWeight: '900', letterSpacing: 0.2 },
  actionLabelLight: { color: L.paper },
  actionArrow: { color: L.ink, fontSize: 19, lineHeight: 19, fontWeight: '700' },
  hero: { flexDirection: 'row', alignItems: 'stretch', gap: 6, paddingTop: 62, paddingBottom: 54 },
  heroCompact: { flexDirection: 'column', paddingTop: 44, paddingBottom: 32, gap: 34 },
  heroCopy: { flex: 1, justifyContent: 'center', minWidth: 0, paddingRight: 32 },
  heroCopyCompact: { paddingRight: 0 },
  eyebrow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: 'rgba(200,255,61,0.45)', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 18 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: L.acid },
  eyebrowText: { color: L.acid, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { color: L.paper, fontSize: 68, lineHeight: 67, fontWeight: '900', letterSpacing: -3.2, maxWidth: 700 },
  heroTitleCompact: { fontSize: 48, lineHeight: 48, letterSpacing: -2.2 },
  heroTitleAccent: { color: L.orange },
  heroMotto: { color: L.lilac, fontSize: 14, lineHeight: 20, fontWeight: '800', marginTop: 22, maxWidth: 420 },
  heroText: { color: L.muted, fontSize: 16, lineHeight: 25, maxWidth: 560, marginTop: 8 },
  heroActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginTop: 26 },
  heroActionsNarrow: { alignItems: 'stretch', flexDirection: 'column', gap: 11 },
  storyLink: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 12 },
  storyLinkText: { color: L.paper, fontSize: 12, fontWeight: '900' },
  storyArrow: { color: L.orange, fontSize: 18 },
  proofRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 26, marginTop: 42, paddingTop: 17, borderTopColor: 'rgba(255,255,255,0.15)', borderTopWidth: 1 },
  proofNumber: { color: L.paper, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  proofLabel: { color: L.muted, fontSize: 9, marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.7 },
  heroVisual: { width: '43%', minHeight: 560, transform: [{ rotate: '1.4deg' }] },
  heroVisualCompact: { width: '100%', minHeight: 390, transform: [{ rotate: '0deg' }] },
  heroImageFrame: { flex: 1, overflow: 'hidden', borderColor: 'rgba(255,255,255,0.24)', borderWidth: 1, backgroundColor: L.inkSoft },
  heroImage: { opacity: 0.94 },
  heroVisualTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  visualTag: { color: L.paper, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  visualBottom: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  visualOrb: { width: 42, height: 42, borderRadius: 22, backgroundColor: L.acid, alignItems: 'center', justifyContent: 'center' },
  visualOrbText: { color: L.ink, fontSize: 22, fontWeight: '900' },
  visualWords: { flex: 1 },
  visualTitle: { color: L.paper, fontSize: 24, lineHeight: 24, fontWeight: '900', letterSpacing: -0.7 },
  visualCaption: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 8 },
  marquee: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12, paddingVertical: 14, borderTopColor: 'rgba(255,255,255,0.14)', borderBottomColor: 'rgba(255,255,255,0.14)', borderBottomWidth: 1, borderTopWidth: 1 },
  marqueeText: { color: L.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  marqueeMark: { color: L.orange, fontSize: 16 },
  storySection: { paddingVertical: 94 },
  sectionHeading: { maxWidth: 690, marginBottom: 35 },
  sectionIndex: { color: L.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 14 },
  sectionIndexLight: { color: L.acid, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 14 },
  sectionTitle: { color: L.paper, fontSize: 52, lineHeight: 52, letterSpacing: -2.2, fontWeight: '900' },
  sectionTitleCompact: { fontSize: 38, lineHeight: 39, letterSpacing: -1.5 },
  sectionIntro: { color: L.muted, fontSize: 15, lineHeight: 24, maxWidth: 530, marginTop: 15 },
  featureGrid: { flexDirection: 'row', gap: 10 },
  featureGridCompact: { flexDirection: 'column', gap: 10 },
  featureCardWrap: { flex: 1 },
  featureCard: { minHeight: 306, padding: 21, justifyContent: 'space-between' },
  featureOrange: { backgroundColor: L.orange },
  featureBlue: { backgroundColor: L.blue },
  featureAcid: { backgroundColor: L.acid },
  featureNumber: { color: L.ink, fontSize: 12, fontWeight: '900' },
  featureTitle: { color: L.paper, fontSize: 29, lineHeight: 29, fontWeight: '900', letterSpacing: -1, maxWidth: 210 },
  featureText: { color: 'rgba(8,11,20,0.72)', fontSize: 14, lineHeight: 21, maxWidth: 270 },
  featureBlueText: { color: L.paper },
  featureFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15, borderTopColor: 'rgba(8,11,20,0.22)', borderTopWidth: 1 },
  featureBorderDark: { borderTopColor: 'rgba(8,11,20,0.3)' },
  featureMeta: { color: 'rgba(8,11,20,0.62)', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  featureIcon: { color: L.paper, fontSize: 24, fontWeight: '700' },
  featureDarkText: { color: L.ink },
  textureBand: { minHeight: 480, flexDirection: 'row', alignItems: 'center', gap: 40, padding: 42, overflow: 'hidden', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 },
  textureBandCompact: { flexDirection: 'column', alignItems: 'stretch', padding: 25, gap: 26 },
  textureImage: { opacity: 0.78 },
  textureOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,20,0.48)' },
  textureCopy: { flex: 1 },
  textureTitle: { color: L.paper, fontSize: 52, lineHeight: 51, letterSpacing: -2.2, fontWeight: '900', maxWidth: 580 },
  textureTitleCompact: { fontSize: 38, lineHeight: 39, letterSpacing: -1.5 },
  textureText: { color: L.muted, fontSize: 15, lineHeight: 24, maxWidth: 480, marginTop: 16 },
  note: { width: 260, minHeight: 180, justifyContent: 'center', padding: 23, backgroundColor: L.bone, transform: [{ rotate: '-5deg' }], shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 9 }, elevation: 5 },
  noteSmall: { color: L.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  noteBig: { color: L.ink, fontSize: 26, lineHeight: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 17 },
  noteLine: { color: L.darkMuted, fontSize: 12, fontWeight: '800', marginTop: 17 },
  peopleSection: { flexDirection: 'row', alignItems: 'center', gap: 55, paddingVertical: 105 },
  peopleSectionCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 30, paddingVertical: 72 },
  peopleImageWrap: { flex: 1, minHeight: 390, transform: [{ rotate: '-1.2deg' }] },
  peopleImageWrapCompact: { minHeight: 270, width: '100%', transform: [{ rotate: '0deg' }] },
  peopleImage: { width: '100%', height: '100%' },
  peopleStamp: { position: 'absolute', left: 14, bottom: 14, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: L.acid, transform: [{ rotate: '3deg' }] },
  peopleStampText: { color: L.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  peopleCopy: { flex: 1, minWidth: 0 },
  peopleTitle: { color: L.paper, fontSize: 46, lineHeight: 46, letterSpacing: -1.9, fontWeight: '900' },
  peopleTitleCompact: { fontSize: 36, lineHeight: 37, letterSpacing: -1.4 },
  finalCta: { alignItems: 'center', paddingVertical: 92, paddingHorizontal: 20, backgroundColor: L.orange },
  finalCtaCircle: { width: 66, height: 66, borderRadius: 34, backgroundColor: L.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  finalCtaCircleText: { color: L.acid, fontSize: 18, fontWeight: '900' },
  finalEyebrow: { color: L.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  finalTitle: { color: L.ink, fontSize: 56, lineHeight: 55, letterSpacing: -2.5, fontWeight: '900', textAlign: 'center', maxWidth: 690, marginTop: 13 },
  finalTitleCompact: { fontSize: 39, lineHeight: 40, letterSpacing: -1.6 },
  finalText: { color: 'rgba(8,11,20,0.67)', fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 430, marginVertical: 18 },
  footer: { minHeight: 108, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 20, paddingVertical: 25, justifyContent: 'space-between' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerName: { color: L.paper, fontSize: 20, fontWeight: '900' },
  footerTagline: { color: L.muted, fontSize: 10, marginTop: 3 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 18 },
  footerLink: { color: L.paper, fontSize: 12, fontWeight: '900' },
  footerMeta: { color: L.muted, fontSize: 11 },
  footerCopyright: { color: L.darkMuted, fontSize: 10, width: '100%', textAlign: 'center' },
});

export default LandingScreen;
