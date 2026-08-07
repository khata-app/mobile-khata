import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BackButton, C, Screen, SERIF, Text, Title } from '@/features/khata/ui';

const sections = [
  {
    number: '01',
    title: 'What Khata stores',
    copy: 'Khata stores the workspace settings, sales, purchases, expenses, inventory, team records and bill documents that you choose to add. This information is used to provide the business tools and reports you ask for.',
  },
  {
    number: '02',
    title: 'How your records are protected',
    copy: 'Each company uses its own Supabase workspace. Database access is protected by row-level security, and the app uses a publishable client key—not a service-role credential. Signed-in access is tied to your user account.',
  },
  {
    number: '03',
    title: 'Offline use and syncing',
    copy: 'Information created while offline can remain on your device until a connection is available. Khata then sends queued changes to the service so your workspace can be kept up to date.',
  },
  {
    number: '04',
    title: 'Your choices and control',
    copy: 'You can update your business details and sign out on your device at any time. You can also ask for help with an export, correction or deletion of your business data by contacting us.',
  },
];

export function PrivacyScreen() {
  return (
    <Screen>
      <BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      <Title subtitle="Plain language about the information behind your business book.">Privacy at Khata</Title>

      <View style={styles.promise}>
        <View style={styles.promiseMark}><Text style={styles.promiseMarkText}>✓</Text></View>
        <View style={styles.promiseCopy}>
          <Text style={styles.promiseTitle}>Your business records belong to you.</Text>
          <Text style={styles.promiseText}>Khata only collects the information needed to run your workspace, keep it in sync and help you understand your business. We do not place private service-role credentials inside the app.</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>At a glance</Text>
          <Text style={styles.summaryItem}>Your account controls access.</Text>
          <Text style={styles.summaryItem}>Company records are kept separate.</Text>
          <Text style={styles.summaryItem}>Offline changes sync when connected.</Text>
          <Text style={styles.summaryItem}>You can request help with your data.</Text>
          <View style={styles.summaryRule} />
          <Text style={styles.updated}>Last updated: 7 August 2026</Text>
        </View>

        <View style={styles.sections}>
          {sections.map(section => (
            <View key={section.number} style={styles.section}>
              <Text style={styles.number}>{section.number}</Text>
              <View style={styles.sectionCopy}>
                <Text style={styles.heading}>{section.title}</Text>
                <Text style={styles.body}>{section.copy}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.contact}>
        <Text style={styles.contactTitle}>Questions about your data?</Text>
        <Text style={styles.contactText}>Contact the Khata team at hello@khata.app and tell us which workspace your question concerns.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  promise: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, borderRadius: 10, padding: 18, maxWidth: 900 },
  promiseMark: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.greenDark },
  promiseMarkText: { color: C.white, fontSize: 20, fontWeight: '800' },
  promiseCopy: { flex: 1, gap: 4 },
  promiseTitle: { color: C.ink, fontSize: 21, lineHeight: 27, fontWeight: '800', fontFamily: SERIF },
  promiseText: { color: C.greenDark, fontSize: 13, lineHeight: 20, maxWidth: 760 },
  content: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 18, maxWidth: 960 },
  summary: { width: 250, padding: 17, gap: 10, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 9 },
  summaryLabel: { color: C.brick, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 2 },
  summaryItem: { color: C.ink, fontSize: 12, lineHeight: 18, paddingLeft: 10, borderLeftColor: C.gold, borderLeftWidth: 2 },
  summaryRule: { height: 1, backgroundColor: C.border, marginTop: 4 },
  updated: { color: C.muted, fontSize: 10, fontStyle: 'italic' },
  sections: { flex: 1, minWidth: 280, gap: 10 },
  section: { flexDirection: 'row', gap: 14, backgroundColor: 'rgba(253,248,238,0.9)', borderColor: C.border, borderWidth: 1, borderRadius: 9, padding: 17 },
  number: { color: C.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 1, paddingTop: 4 },
  sectionCopy: { flex: 1, gap: 6 },
  heading: { color: C.ink, fontSize: 20, fontWeight: '800', fontFamily: SERIF },
  body: { color: C.muted, fontSize: 13, lineHeight: 21 },
  contact: { maxWidth: 960, backgroundColor: C.redLight, borderColor: C.mud, borderWidth: 1, borderRadius: 9, padding: 17, gap: 4 },
  contactTitle: { color: C.brickDark, fontSize: 17, fontWeight: '800', fontFamily: SERIF },
  contactText: { color: C.muted, fontSize: 12, lineHeight: 18 },
});

export default PrivacyScreen;
