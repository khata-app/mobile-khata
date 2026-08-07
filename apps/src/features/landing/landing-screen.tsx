import { router } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { KhataLogo } from '@/features/khata/brand';
import { ArrowRightIcon, BoxIcon, CameraIcon, LedgerIcon, ReceiptIcon, TrendingUpIcon } from '@/features/khata/icons';
import { C, ruledPaper, SERIF } from '@/features/khata/ui';

const community = require('../../../assets/landing/khata-community.jpg');
const desk = require('../../../assets/landing/notebook-desk.jpg');
const shelf = require('../../../assets/landing/stock-shelf.jpg');

const features = [
  { icon: CameraIcon, title: 'Photograph a bill', text: 'Use the camera or choose a photo. Check the details, then save.' },
  { icon: TrendingUpIcon, title: 'Record a sale', text: 'Keep cash, credit and stock together without a complicated checkout.' },
  { icon: BoxIcon, title: 'Know what is left', text: 'See quantities and low-stock items before the kitchen or counter runs short.' },
  { icon: LedgerIcon, title: 'Read the numbers', text: 'Open clear sales, expense, stock and tax reports from the same book.' },
];

export function LandingScreen() {
  const { width } = useWindowDimensions();
  const mobile = width < 760;

  return (
    <SafeAreaView style={styles.safe}>
      <FocusAwareStatusBar />
      <ImageBackground source={desk} resizeMode="cover" imageStyle={styles.deskImage} style={styles.desk}>
        <ScrollView contentContainerStyle={[styles.scroll, ruledPaper]} showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
            <View style={styles.nav}>
              <View style={styles.brand}>
                <KhataLogo size={40} />
                <View>
                  <Text style={styles.brandName}>Khata</Text>
                  <Text style={styles.brandNote}>A simple business book</Text>
                </View>
              </View>
              <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}>
                <Text style={styles.signInText}>Sign in</Text>
                <ArrowRightIcon size={15} color={C.paperLight} />
              </Pressable>
            </View>

            <View style={[styles.hero, mobile && styles.heroMobile]}>
              <View style={styles.heroCopy}>
                <View style={styles.kicker}>
                  <View style={styles.kickerLine} />
                  <Text style={styles.kickerText}>Made for busy counters and kitchens</Text>
                </View>
                <Text style={[styles.heroTitle, mobile && styles.heroTitleMobile]}>
                  Your daily business,
                  {`\n`}
                  kept in one good book.
                </Text>
                <Text style={styles.heroText}>Photograph bills, record sales, watch stock and check reports from one calm workspace. Built mobile-first for small businesses in Nepal.</Text>
                <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
                  <Text style={styles.primaryText}>Open your book</Text>
                  <ArrowRightIcon size={17} color={C.paperLight} />
                </Pressable>
                <View style={styles.marginNote}><Text style={styles.marginNoteText}>English · Light mode · NPR</Text></View>
              </View>
              <View style={styles.heroVisual}>
                <Image source={shelf} resizeMode="cover" style={styles.heroImage} />
                <View style={styles.paperSlip}>
                  <ReceiptIcon size={21} color={C.brick} />
                  <Text style={styles.slipTitle}>Today’s book</Text>
                  <View style={styles.slipRule} />
                  <Text style={styles.slipRow}>Sales      NPR 38,450</Text>
                  <Text style={styles.slipRow}>Expenses    NPR 6,200</Text>
                  <Text style={styles.slipTotal}>Balance    NPR 32,250</Text>
                </View>
                <View style={styles.tape} />
              </View>
            </View>

            <View style={styles.rule}><Text style={styles.ruleMark}>✦</Text></View>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>The things you do every day.</Text>
              <Text style={styles.sectionText}>No accounting language to decode. Each tool says what it does.</Text>
            </View>
            <View style={styles.featureGrid}>
              {features.map((feature, index) => {
                const Icon = feature.icon; return (
                  <View key={feature.title} style={styles.feature}>
                    <View style={[styles.sketchIcon, index % 2 === 0 && styles.sketchIconTilt]}><Icon size={25} color={C.brickDark} /></View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureText}>{feature.text}</Text>
                    <Text style={styles.pencilNumber}>
                      0
                      {index + 1}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={[styles.story, mobile && styles.storyMobile]}>
              <Image source={community} resizeMode="cover" style={styles.storyImage} />
              <View style={styles.storyCopy}>
                <Text style={styles.handNote}>Built around real work</Text>
                <Text style={styles.storyTitle}>Useful at opening time. Useful at closing time.</Text>
                <Text style={styles.storyText}>Khata keeps purchases, sales, stock, expenses, staff and reports close together. Start on your phone at the counter and continue on the web when you need more room.</Text>
                <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.textLink, pressed && styles.pressed]}>
                  <Text style={styles.textLinkText}>Sign in to Khata</Text>
                  <ArrowRightIcon size={16} color={C.brick} />
                </Pressable>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.brand}>
                <KhataLogo size={32} />
                <Text style={styles.footerName}>Khata</Text>
              </View>
              <Text style={styles.footerText}>A clear business book, wherever the day takes you.</Text>
              <View style={styles.footerLinks}>
                <Pressable onPress={() => router.push('/about')}><Text style={styles.footerLink}>About</Text></Pressable>
                <Pressable onPress={() => router.push('/privacy')}><Text style={styles.footerLink}>Privacy</Text></Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  desk: { flex: 1, backgroundColor: C.cream },
  deskImage: { opacity: 0.08 },
  scroll: { flexGrow: 1, backgroundColor: 'rgba(250,243,229,0.92)' },
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 20 },
  nav: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: C.border, borderBottomWidth: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandName: { color: C.ink, fontSize: 23, fontWeight: '800', fontFamily: SERIF },
  brandNote: { color: C.muted, fontSize: 10, marginTop: 1, letterSpacing: 0.5 },
  signIn: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, backgroundColor: C.brick, borderRadius: 7, borderColor: C.brickDark, borderWidth: 1 },
  signInText: { color: C.paperLight, fontSize: 13, fontWeight: '800' },
  hero: { minHeight: 590, flexDirection: 'row', alignItems: 'center', gap: 48, paddingVertical: 58 },
  heroMobile: { minHeight: 0, flexDirection: 'column', alignItems: 'stretch', gap: 34, paddingTop: 42, paddingBottom: 46 },
  heroCopy: { flex: 1, alignItems: 'flex-start' },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  kickerLine: { width: 30, height: 2, backgroundColor: C.brick, transform: [{ rotate: '-2deg' }] },
  kickerText: { color: C.greenDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle: { color: C.ink, fontSize: 55, lineHeight: 60, fontWeight: '800', fontFamily: SERIF, letterSpacing: -1.5 },
  heroTitleMobile: { fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  heroText: { color: C.muted, fontSize: 16, lineHeight: 25, maxWidth: 540, marginTop: 20 },
  primary: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 19, marginTop: 27, backgroundColor: C.brick, borderRadius: 8, borderColor: C.brickDark, borderWidth: 1 },
  primaryText: { color: C.paperLight, fontSize: 14, fontWeight: '800' },
  marginNote: { marginTop: 18, borderBottomColor: C.gold, borderBottomWidth: 1, paddingBottom: 3, transform: [{ rotate: '-1deg' }] },
  marginNoteText: { color: C.muted, fontSize: 11, fontFamily: SERIF, fontStyle: 'italic' },
  heroVisual: { flex: 0.82, minHeight: 410, position: 'relative', justifyContent: 'center' },
  heroImage: { width: '100%', height: 370, borderRadius: 5, borderColor: C.ink, borderWidth: 1, transform: [{ rotate: '1.2deg' }] },
  paperSlip: { position: 'absolute', left: -14, bottom: 12, width: 230, padding: 17, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, transform: [{ rotate: '-2.5deg' }] },
  slipTitle: { color: C.ink, fontSize: 18, fontWeight: '800', fontFamily: SERIF, marginTop: 8 },
  slipRule: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  slipRow: { color: C.muted, fontSize: 11, lineHeight: 21, fontFamily: 'monospace' },
  slipTotal: { color: C.brickDark, fontSize: 12, lineHeight: 25, fontWeight: '800', fontFamily: 'monospace' },
  tape: { position: 'absolute', width: 85, height: 24, top: 5, right: '35%', backgroundColor: 'rgba(223,198,140,0.75)', transform: [{ rotate: '-4deg' }] },
  rule: { height: 28, alignItems: 'center', justifyContent: 'center', borderTopColor: C.border, borderTopWidth: 1 },
  ruleMark: { color: C.goldDark, backgroundColor: C.paper, paddingHorizontal: 13, marginTop: -28 },
  sectionHead: { alignItems: 'center', paddingTop: 26, paddingBottom: 24 },
  sectionTitle: { color: C.ink, fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: SERIF, textAlign: 'center' },
  sectionText: { color: C.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 58 },
  feature: { flex: 1, flexBasis: 230, minWidth: 220, minHeight: 215, padding: 18, backgroundColor: 'rgba(253,248,238,0.88)', borderColor: C.border, borderWidth: 1, borderRadius: 7, overflow: 'hidden' },
  sketchIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, transform: [{ rotate: '2deg' }] },
  sketchIconTilt: { backgroundColor: C.redLight, borderColor: C.mud, transform: [{ rotate: '-2deg' }] },
  featureTitle: { color: C.ink, fontSize: 18, fontWeight: '800', fontFamily: SERIF, marginTop: 18 },
  featureText: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 7, maxWidth: 240 },
  pencilNumber: { position: 'absolute', right: 12, bottom: 5, color: 'rgba(138,114,87,0.18)', fontSize: 38, fontFamily: SERIF, fontStyle: 'italic' },
  story: { flexDirection: 'row', alignItems: 'stretch', gap: 0, marginBottom: 58, borderColor: C.border, borderWidth: 1, backgroundColor: C.paperLight },
  storyMobile: { flexDirection: 'column' },
  storyImage: { flex: 1, minHeight: 330 },
  storyCopy: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', padding: 30 },
  handNote: { color: C.greenDark, fontSize: 13, fontFamily: SERIF, fontStyle: 'italic', transform: [{ rotate: '-1deg' }] },
  storyTitle: { color: C.ink, fontSize: 31, lineHeight: 36, fontWeight: '800', fontFamily: SERIF, marginTop: 13 },
  storyText: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 14 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingBottom: 4, borderBottomColor: C.brick, borderBottomWidth: 1 },
  textLinkText: { color: C.brick, fontSize: 13, fontWeight: '800' },
  footer: { minHeight: 104, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18, borderTopColor: C.border, borderTopWidth: 1, paddingVertical: 24 },
  footerName: { color: C.ink, fontSize: 18, fontWeight: '800', fontFamily: SERIF },
  footerText: { flex: 1, minWidth: 210, color: C.muted, fontSize: 12 },
  footerLinks: { flexDirection: 'row', gap: 18 },
  footerLink: { color: C.brick, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
