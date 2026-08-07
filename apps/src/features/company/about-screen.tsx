import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { BackButton, Button, C, Screen, SERIF, Text, Title } from '@/features/khata/ui';

const team = [
  { name: 'Praagya', role: 'Developer', note: 'Product craft and the everyday details that make Khata feel useful.' },
  { name: 'Sharad', role: 'Developer', note: 'Reliable systems for businesses that cannot afford to lose a day.' },
  { name: 'Shishir', role: 'Developer', note: 'Simple interfaces for owners, teams and the next generation of work.' },
];

export function AboutScreen() {
  return <Screen><BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /><Title subtitle="The people and the belief behind Khata.">About Khata</Title><Image source={require('../../../assets/landing/khata-community.jpg')} style={styles.heroImage} resizeMode="cover" /><View style={styles.intro}><Text style={styles.heading}>Digitalizing small and medium scale businesses.</Text><Text style={styles.body}>Khata is being built for the businesses that make neighborhoods work: the kirana shop, the family café, the repair counter, the growing service team. We believe clear books should feel as natural as a trusted notebook.</Text></View><Text style={styles.sectionTitle}>The team</Text><View style={styles.team}>{team.map(person => <View key={person.name} style={styles.person}><View style={styles.avatar}><Text style={styles.avatarText}>{person.name.slice(0, 1)}</Text></View><View style={styles.personCopy}><Text style={styles.personName}>{person.name}</Text><Text style={styles.personRole}>{person.role}</Text><Text style={styles.personNote}>{person.note}</Text></View></View>)}</View><Button label="Open your workspace" onPress={() => router.push('/login')} /></Screen>;
}

const styles = StyleSheet.create({
  heroImage: { width: '100%', height: 280, borderRadius: 8 },
  intro: { gap: 10, maxWidth: 720 },
  heading: { color: C.ink, fontSize: 32, lineHeight: 37, fontFamily: SERIF, fontWeight: '800' },
  body: { color: C.muted, fontSize: 15, lineHeight: 24 },
  sectionTitle: { color: C.ink, fontSize: 22, fontWeight: '800', fontFamily: SERIF, borderBottomColor: C.border, borderBottomWidth: 1, paddingBottom: 8 },
  team: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  person: { flex: 1, minWidth: 220, flexDirection: 'row', gap: 12, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, padding: 14, borderRadius: 8 },
  avatar: { width: 42, height: 42, borderRadius: 8, backgroundColor: C.brick, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontSize: 20, fontWeight: '800', fontFamily: SERIF },
  personCopy: { flex: 1, gap: 2 },
  personName: { color: C.ink, fontSize: 16, fontWeight: '800' },
  personRole: { color: C.brick, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  personNote: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
});

export default AboutScreen;
