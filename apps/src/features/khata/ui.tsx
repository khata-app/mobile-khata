import * as React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { CaretDownIcon, CheckIcon, ChevronLeftIcon } from '@/features/khata/icons';

export { Text };

export const C = {
  cream: '#F3E9D8', ink: '#2C2115', muted: '#8A7257', border: '#DCC9A8', brick: '#8D3117', brickDark: '#6E2612', mud: '#A9714A', gold: '#B98A2F', goldDark: '#8A6A1F', green: '#5F7A4E', greenDark: '#47603A', greenLight: '#E7EDDF', red: '#A64B33', redLight: '#F6E4DC', white: '#FFFFFF', paper: '#FAF3E5', paperLight: '#FDF8EE', blueLight: '#EFF6FF', yellowLight: '#F6E9C8', line: '#1F1B16',
};

// Serif display face for the old-ledger feel. On native 'serif' maps to the
// platform serif font; on web we use Georgia so both targets look book-like.
export const SERIF: string = Platform.select({ web: `Georgia, 'Times New Roman', serif`, default: 'serif' });

export const ruledPaper: object = Platform.select({
  web: {
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(110,38,18,0.05) 31px, rgba(110,38,18,0.05) 32px)',
  },
  default: {},
});

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const content = <View style={[styles.container, ruledPaper]}>{children}</View>;
  return <SafeAreaView style={styles.safe}><FocusAwareStatusBar />{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function Title({ children, subtitle }: { children: React.ReactNode; subtitle?: React.ReactNode }) { return <View style={styles.titleBlock}><Text style={styles.title}>{children}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>; }
export function Card({ children, style }: { children: React.ReactNode; style?: object }) { return <View style={[styles.card, style]}>{children}</View>; }
export function SectionHeader({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) { return <View style={styles.sectionHeader}><View style={styles.sectionTitleWrap}><Text style={styles.sectionTitle}>{title}</Text>{detail && <Text style={styles.sectionDetail}>{detail}</Text>}</View>{action}</View>; }
export function Button({ label, onPress, variant = 'primary', disabled = false, icon }: { label: string; onPress?: () => void; variant?: 'primary' | 'outline' | 'danger' | 'ghost'; disabled?: boolean; icon?: React.ReactNode }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'primary' && styles.primary, variant === 'outline' && styles.outline, variant === 'danger' && styles.danger, variant === 'ghost' && styles.ghost, pressed && styles.pressed, disabled && styles.disabled]}><View style={styles.buttonInner}>{icon}{<Text style={[styles.buttonText, variant === 'primary' && styles.primaryText, variant === 'outline' && styles.outlineText, variant === 'danger' && styles.dangerText, variant === 'ghost' && styles.ghostText]}>{label}</Text>}</View></Pressable>; }
export function BackButton({ onPress, label = 'Back' }: { onPress?: () => void; label?: string }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><ChevronLeftIcon size={17} color={C.brick} /><Text style={styles.backText}>{label}</Text></Pressable>; }
export function Select({ label, value, options, onChange, placeholder = 'Select…' }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void; placeholder?: string }) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find(option => option.value === value);
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.input, styles.select, pressed && { opacity: 0.75 }]}>
      <Text style={[styles.selectValue, !selected && styles.selectPlaceholder]}>{selected ? selected.label : placeholder}</Text>
      <CaretDownIcon size={16} color={C.muted} />
    </Pressable>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
        <View style={styles.dropdown}>
          {options.map(option => {
            const active = option.value === value;
            return <Pressable key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && { opacity: 0.75 }]}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
              {active && <CheckIcon size={15} color={C.brick} />}
            </Pressable>;
          })}
        </View>
      </Pressable>
    </Modal>
  </View>;
}
export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric' | 'phone-pad'; multiline?: boolean }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.muted} keyboardType={keyboardType} multiline={multiline} style={[styles.input, multiline && styles.multiline]} /></View>; }
export function Chip({ children, tone = 'neutral', icon }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'gold' | 'red'; icon?: React.ReactNode }) { return <View style={[styles.chip, tone === 'green' && { backgroundColor: C.greenLight }, tone === 'gold' && { backgroundColor: C.yellowLight }, tone === 'red' && { backgroundColor: C.redLight }]}>{icon}<Text style={[styles.chipText, tone === 'green' && { color: C.green }, tone === 'gold' && { color: C.goldDark }, tone === 'red' && { color: C.red }]}>{children}</Text></View>; }
export function Stat({ label, value, hint, tone = 'green' }: { label: string; value: string; hint?: string; tone?: 'green' | 'gold' | 'red' | 'brick' }) { const background = tone === 'green' ? C.greenLight : tone === 'gold' ? C.yellowLight : tone === 'red' ? C.redLight : '#F1E2D4'; const color = tone === 'green' ? C.green : tone === 'gold' ? C.goldDark : tone === 'red' ? C.red : C.brick; return <View style={[styles.stat, { backgroundColor: background }]}><Eyebrow>{label}</Eyebrow><Text style={[styles.statValue, { color }]}>{value}</Text>{hint && <Text style={styles.statHint}>{hint}</Text>}</View>; }

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  scroll: { paddingBottom: 36 },
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  titleBlock: { gap: 5, marginBottom: 2, borderBottomColor: C.border, borderBottomWidth: 1, paddingBottom: 14 },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: C.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.4, fontFamily: SERIF },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: 'rgba(253,248,238,0.94)', borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 16, gap: 10, ...Platform.select({ web: { boxShadow: '0 1px 0 rgba(110,38,18,0.06)' }, default: { shadowColor: '#6E2612', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 } }) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginTop: 10, paddingBottom: 4, borderBottomColor: C.border, borderBottomWidth: 1 },
  sectionTitleWrap: { flex: 1, gap: 2 },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.2 },
  sectionDetail: { color: C.muted, fontSize: 12 },
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: C.border, borderWidth: 1, minHeight: 46, paddingHorizontal: 16 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: C.brick, borderColor: C.brickDark },
  outline: { backgroundColor: 'transparent', borderColor: C.gold },
  danger: { backgroundColor: C.redLight, borderColor: '#DFB4A4' },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  buttonText: { color: C.ink, fontWeight: '800', fontSize: 13, letterSpacing: 0.2 },
  primaryText: { color: C.white },
  outlineText: { color: C.brick },
  dangerText: { color: C.red },
  ghostText: { color: C.brick },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  field: { gap: 5, flex: 1, minWidth: 140 },
  fieldLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  input: { backgroundColor: C.white, borderColor: C.border, borderWidth: 1, borderRadius: 10, minHeight: 44, paddingHorizontal: 12, color: C.ink, fontSize: 14, fontWeight: '600' },
  multiline: { minHeight: 78, paddingTop: 12, textAlignVertical: 'top' },
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderColor: C.border, borderWidth: 1, backgroundColor: C.paper, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  stat: { flex: 1, minWidth: 145, borderRadius: 12, padding: 15, gap: 7, borderTopWidth: 3, borderTopColor: C.border },
  statValue: { fontSize: 22, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.3 },
  statHint: { color: C.muted, fontSize: 11 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { color: C.brick, fontSize: 13, fontWeight: '800' },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectValue: { color: C.ink, fontSize: 14, fontWeight: '600', flex: 1 },
  selectPlaceholder: { color: C.muted },
  overlay: { flex: 1, backgroundColor: 'rgba(44,33,21,0.4)', justifyContent: 'center', paddingHorizontal: 28 },
  dropdown: { backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 6, gap: 2, maxHeight: 420, ...Platform.select({ web: { boxShadow: '0 12px 40px rgba(110,38,18,0.25)' }, default: { shadowColor: '#6E2612', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 } }) },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 12 },
  optionActive: { backgroundColor: C.redLight },
  optionText: { color: C.ink, fontSize: 14, fontWeight: '700', flex: 1 },
  optionTextActive: { color: C.brick },
});
