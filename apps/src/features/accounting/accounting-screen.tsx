import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LedgerIcon, MinusIcon, PlusIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Field, Screen, SectionHeader, Select, Text, Title } from '@/features/khata/ui';
import { listAccounts, postVoucher } from '@/lib/supabase-repository';
import { fromPaisa, totalCredit, totalDebit, type Account, type VoucherType, voucherTypes } from './domain';

type DraftLine = { accountId: string; debit: string; credit: string; description: string };

const today = () => new Date().toISOString().slice(0, 10);
const labels: Record<VoucherType, string> = {
  sales: 'Sales invoice',
  purchase: 'Purchase invoice',
  payment: 'Payment',
  receipt: 'Receipt',
  contra: 'Contra',
  journal: 'Journal',
  credit_note: 'Credit note',
  debit_note: 'Debit note',
  stock_journal: 'Stock journal',
};

function emptyLine(): DraftLine {
  return { accountId: '', debit: '', credit: '', description: '' };
}

export default function AccountingScreen() {
  const businessId = useKhataStore.use.businessId();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [voucherType, setVoucherType] = useState<VoucherType>('journal');
  const [date, setDate] = useState(today());
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([emptyLine(), emptyLine()]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    void listAccounts(businessId).then(next => {
      setAccounts(next);
      setLines(current => current.map((line, index) => ({ ...line, accountId: line.accountId || next[index]?.id || '' })));
    }).catch(error => setStatus(error instanceof Error ? error.message : 'Accounts could not be loaded'));
  }, [businessId]);

  const accountOptions = accounts.filter(account => account.isActive).map(account => ({ label: `${account.code} · ${account.name}`, value: account.id }));
  const totals = useMemo(() => ({ debit: totalDebit(lines.map(line => ({ ...line, debit: Number(line.debit) || 0, credit: Number(line.credit) || 0 }))), credit: totalCredit(lines.map(line => ({ ...line, debit: Number(line.debit) || 0, credit: Number(line.credit) || 0 }))) }), [lines]);
  const balanced = totals.debit > 0 && totals.debit === totals.credit;

  const updateLine = (index: number, key: keyof DraftLine, value: string) => setLines(current => current.map((line, lineIndex) => lineIndex === index ? { ...line, [key]: value, ...(key === 'debit' && value ? { credit: '' } : {}), ...(key === 'credit' && value ? { debit: '' } : {}) } : line));

  const save = async () => {
    if (!businessId) return setStatus('Create or select a business before posting a voucher.');
    if (!balanced) return setStatus('The voucher must have equal debit and credit totals.');
    setLoading(true);
    setStatus('Posting voucher…');
    try {
      const posted = await postVoucher({
        businessId,
        voucherType,
        transactionDate: date,
        idempotencyKey: `mobile-${businessId}-${voucherType}-${date}-${Date.now()}`,
        narration,
        lines: lines.map(line => ({ accountId: line.accountId, debit: Number(line.debit) || 0, credit: Number(line.credit) || 0, description: line.description })),
      });
      setStatus(`Posted ${labels[posted.voucherType]} · ${posted.id.slice(0, 8)}`);
      setNarration('');
      setLines([emptyLine(), emptyLine()]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Voucher could not be posted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Title subtitle="Post balanced entries directly into the business ledger.">Accounting</Title>
        </View>
        <Chip tone={balanced ? 'green' : 'gold'} icon={<LedgerIcon size={13} color={balanced ? C.greenDark : C.goldDark} />}>{balanced ? 'Balanced' : 'Needs balancing'}</Chip>
      </View>
      <Card>
        <SectionHeader title="New voucher" detail="Posted entries cannot be silently edited" />
        <View style={styles.fieldRow}>
          <Select label="Voucher type" value={voucherType} options={voucherTypes.map(type => ({ label: labels[type], value: type }))} onChange={value => setVoucherType(value as VoucherType)} />
          <Field label="Transaction date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </View>
        <Field label="Narration" value={narration} onChangeText={setNarration} placeholder="Why was this entry posted?" />
      </Card>
      <Card>
        <SectionHeader title="Ledger lines" detail="Each line must be debit or credit, never both" action={<Button label="Add line" variant="outline" icon={<PlusIcon size={14} color={C.brick} />} onPress={() => setLines(current => [...current, emptyLine()])} />} />
        {lines.map((line, index) => (
          <View key={`line-${index}`} style={styles.line}>
            <Select label={`Account ${index + 1}`} value={line.accountId} options={accountOptions} onChange={value => updateLine(index, 'accountId', value)} placeholder={accounts.length ? 'Select account' : 'No accounts available'} />
            <View style={styles.fieldRow}>
              <Field label="Debit (NPR)" value={line.debit} onChangeText={value => updateLine(index, 'debit', value)} keyboardType="numeric" placeholder="0" />
              <Field label="Credit (NPR)" value={line.credit} onChangeText={value => updateLine(index, 'credit', value)} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.lineBottom}>
              <View style={{ flex: 1 }}><Field label="Description" value={line.description} onChangeText={value => updateLine(index, 'description', value)} placeholder="Optional" /></View>
              {lines.length > 2 && <Pressable accessibilityRole="button" accessibilityLabel={`Remove line ${index + 1}`} onPress={() => setLines(current => current.filter((_, lineIndex) => lineIndex !== index))} style={styles.remove}><MinusIcon size={15} color={C.red} /><Text style={styles.removeText}>Remove</Text></Pressable>}
            </View>
          </View>
        ))}
        <View style={styles.totals}>
          <Text style={styles.totalLabel}>Debit NPR {fromPaisa(totals.debit).toLocaleString()}</Text>
          <Text style={styles.totalLabel}>Credit NPR {fromPaisa(totals.credit).toLocaleString()}</Text>
          <Text style={[styles.difference, balanced ? styles.good : styles.bad]}>Difference NPR {fromPaisa(Math.abs(totals.debit - totals.credit)).toLocaleString()}</Text>
        </View>
        <Button label={loading ? 'Posting…' : 'Post voucher'} onPress={() => { void save(); }} disabled={loading || !balanced || !lines.every(line => line.accountId)} />
        {status && <Text style={styles.status}>{status}</Text>}
      </Card>
      <Text style={styles.note}>The server validates the business membership, open fiscal period, account ownership, idempotency key, and balanced paisa totals before saving.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  headerCopy: { flex: 1, minWidth: 220 },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  line: { gap: 9, paddingVertical: 12, borderBottomColor: C.border, borderBottomWidth: 1 },
  lineBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  remove: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, borderColor: '#DFB4A4', borderWidth: 1, borderRadius: 9, backgroundColor: C.redLight },
  removeText: { color: C.red, fontSize: 11, fontWeight: '800' },
  totals: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 12 },
  totalLabel: { color: C.ink, fontSize: 12, fontWeight: '800' },
  difference: { fontSize: 12, fontWeight: '800' },
  good: { color: C.greenDark },
  bad: { color: C.red },
  status: { color: C.greenDark, fontSize: 12, lineHeight: 18 },
  note: { color: C.muted, fontSize: 11, lineHeight: 17 },
});
