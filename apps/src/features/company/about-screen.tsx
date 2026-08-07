import { router } from 'expo-router';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BackButton, Button, C, Screen, SERIF, Text, Title } from '@/features/khata/ui';

const team = [
  { name: 'Praagya', role: 'Developer', note: 'Product craft and the everyday details that make Khata feel useful.' },
  { name: 'Sharad', role: 'Developer', note: 'Reliable systems for businesses that cannot afford to lose a day.' },
  { name: 'Shishir', role: 'Developer', note: 'Simple interfaces for owners, teams and the next generation of work.' },
];

const principles = [
  ['Clear by default', 'Every screen should make sense without accounting jargon or a training manual.'],
  ['Built for real work', 'Khata follows the rhythm of busy counters, kitchens and growing teams.'],
  ['Your book, your control', 'Business records stay organized, portable and under the owner’s control.'],
];

export function AboutScreen() {
  const compact = useWindowDimensions().width < 760;

  return (
    <Screen>
      <BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      <Title subtitle="A practical business book, shaped around the people who use it.">About Khata</Title>

      <View style={[styles.hero, compact && styles.heroCompact]}>
        <Image
          source={require('../../../assets/landing/khata-community.jpg')}
          style={[styles.heroImage, compact && styles.heroImageCompact]}
          resizeMode="cover"
        />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Why we are building Khata</Text>
          <Text style={styles.heading}>Good business tools should feel as familiar as a trusted notebook.</Text>
          <Text style={styles.body}>Khata is built for the businesses that make neighborhoods work: the kirana shop, the family café, the repair counter and the growing service team. It brings sales, expenses, stock and reports together without making the work feel more complicated.</Text>
        </View>
      </View>

      <View style={styles.principles}>
        {principles.map(([title, copy], index) => (
          <View key={title} style={styles.principle}>
            <Text style={styles.principleNumber}>
              0
              {index + 1}
            </Text>
            <Text style={styles.principleTitle}>{title}</Text>
            <Text style={styles.principleCopy}>{copy}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>The team behind the book</Text>
        <Text style={styles.sectionNote}>A small team focused on useful, dependable software for Nepal’s businesses.</Text>
      </View>
      <View style={styles.team}>
        {team.map(person => (
          <View key={person.name} style={styles.person}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{person.name.slice(0, 1)}</Text></View>
            <View style={styles.personCopy}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personRole}>{person.role}</Text>
              <Text style={styles.personNote}>{person.note}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.cta}>
        <View style={styles.ctaCopy}>
          <Text style={styles.ctaTitle}>Ready to open your book?</Text>
          <Text style={styles.ctaText}>Sign in and return to your business workspace.</Text>
        </View>
        <Button label="Open your workspace" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 28, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 10, padding: 16 },
  heroCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 20 },
  heroImage: { width: '40%', maxWidth: 380, height: 230, borderRadius: 7 },
  heroImageCompact: { width: '100%', maxWidth: 520, height: 210, alignSelf: 'center' },
  heroCopy: { flex: 1, gap: 11, paddingRight: 10 },
  eyebrow: { color: C.greenDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1 },
  heading: { color: C.ink, fontSize: 29, lineHeight: 35, fontFamily: SERIF, fontWeight: '800' },
  body: { color: C.muted, fontSize: 14, lineHeight: 23, maxWidth: 660 },
  principles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  principle: { flex: 1, flexBasis: 230, minWidth: 220, padding: 17, backgroundColor: 'rgba(253,248,238,0.86)', borderColor: C.border, borderWidth: 1, borderRadius: 8 },
  principleNumber: { color: C.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  principleTitle: { color: C.ink, fontSize: 19, fontWeight: '800', fontFamily: SERIF, marginTop: 12 },
  principleCopy: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 6 },
  sectionHeading: { gap: 4, marginTop: 10, borderBottomColor: C.border, borderBottomWidth: 1, paddingBottom: 10 },
  sectionTitle: { color: C.ink, fontSize: 23, fontWeight: '800', fontFamily: SERIF },
  sectionNote: { color: C.muted, fontSize: 12, lineHeight: 18 },
  team: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  person: { flex: 1, minWidth: 220, flexDirection: 'row', gap: 12, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, padding: 14, borderRadius: 8 },
  avatar: { width: 42, height: 42, borderRadius: 8, backgroundColor: C.brick, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontSize: 20, fontWeight: '800', fontFamily: SERIF },
  personCopy: { flex: 1, gap: 2 },
  personName: { color: C.ink, fontSize: 16, fontWeight: '800' },
  personRole: { color: C.brick, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  personNote: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  cta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 8, backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, borderRadius: 10, padding: 18 },
  ctaCopy: { flex: 1, minWidth: 220, gap: 3 },
  ctaTitle: { color: C.ink, fontSize: 19, fontWeight: '800', fontFamily: SERIF },
  ctaText: { color: C.greenDark, fontSize: 12 },
});

export default AboutScreen;
