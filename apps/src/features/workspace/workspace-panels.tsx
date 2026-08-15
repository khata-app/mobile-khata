import type { ReactNode } from 'react';
import type { Bill, Employee, InventoryItem } from '@/features/khata/types';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AlertTriangleIcon, BoxIcon, CameraIcon, EditIcon, PlusIcon, ReceiptIcon, TrashIcon, TrendingUpIcon, UploadIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Eyebrow, Field, Screen, SectionHeader, Select, Stat, Text, Title } from '@/features/khata/ui';
import { saveBillDocument, scanBill } from '@/lib/supabase-repository';

const money = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;
const num = (value: string) => Number(value) || 0;

type CaptureAsset = { base64: string; mimeType: string };

async function pickBill(source: 'camera' | 'gallery'): Promise<CaptureAsset | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph a bill. You can still choose an existing photo.');
      return null;
    }
  }
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], base64: true, quality: 0.75, allowsEditing: false })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.75, allowsEditing: false });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset?.base64 ? { base64: asset.base64, mimeType: asset.mimeType || 'image/jpeg' } : null;
}

const paymentOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit', value: 'Credit' },
  { label: 'Bank transfer', value: 'Bank transfer' },
  { label: 'Online payment', value: 'Online payment' },
];

const paymentStatusOptions = [
  { label: 'Paid', value: 'paid' },
  { label: 'Partially paid', value: 'partially_paid' },
  { label: 'Pending', value: 'pending' },
];

const expenseCategoryOptions = [
  { label: 'General', value: 'General' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Supplies', value: 'Supplies' },
  { label: 'Salaries', value: 'Salaries' },
  { label: 'Other', value: 'Other' },
];

const inventoryCategoryOptions = [
  { label: 'Grains', value: 'Grains' },
  { label: 'Grocery', value: 'Grocery' },
  { label: 'Dairy', value: 'Dairy' },
  { label: 'Beverages', value: 'Beverages' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Cleaning', value: 'Cleaning' },
  { label: 'General', value: 'General' },
];

const unitOptions = [
  { label: 'pcs', value: 'pcs' },
  { label: 'kg', value: 'kg' },
  { label: 'bag', value: 'bag' },
  { label: 'bottle', value: 'bottle' },
  { label: 'packet', value: 'packet' },
  { label: 'litre', value: 'litre' },
  { label: 'dozen', value: 'dozen' },
];

const departmentOptions = [
  { label: 'General', value: 'General' },
  { label: 'Shop floor', value: 'Shop floor' },
  { label: 'Delivery', value: 'Delivery' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Accounting', value: 'Accounting' },
  { label: 'Warehouse', value: 'Warehouse' },
];

const benefitTypeOptions = [
  { label: 'Bonus', value: 'Bonus' },
  { label: 'Dashain allowance', value: 'Dashain allowance' },
  { label: 'Festival advance', value: 'Festival advance' },
  { label: 'Transport allowance', value: 'Transport allowance' },
  { label: 'Health insurance', value: 'Health insurance' },
  { label: 'Other', value: 'Other' },
];

export function BillsPanel({ onNavigate }: { onNavigate: (section: string) => void }) {
  const bills = useKhataStore.use.bills();
  return (
    <Screen>
      <Title subtitle="All recorded purchase bills, including scanned documents.">Bills</Title>
      <View style={styles.statRow}>
        <Stat label="Saved bills" value={String(bills.length)} hint="Purchase records" tone="brick" />
        <Stat label="Purchase total" value={money(bills.reduce((s, b) => s + b.total, 0))} hint="Current period" tone="gold" />
      </View>
      <SectionHeader title="Purchase register" detail="Supplier, invoice, date and amount" action={<Button label="New purchase" icon={<PlusIcon size={16} color={C.white} />} onPress={() => onNavigate('purchase-scan')} />} />
      {bills.map(bill => <Record key={bill.id} title={bill.vendor} detail={`${bill.invoice} · ${bill.date} · ${bill.payment} · ${bill.paymentStatus || (bill.payment === 'Credit' ? 'pending' : 'paid')}`} amount={money(bill.total)} tone={bill.status === 'saved' ? 'green' : 'gold'} />)}
      {bills.length === 0 && <Empty text="No purchase bills yet. Scan or enter your first one." />}
    </Screen>
  );
}

export function PurchasePanel({ onNavigate }: { onNavigate: (section: string) => void }) {
  const addBill = useKhataStore.use.addBill();
  const businessId = useKhataStore.use.businessId();
  const [form, setForm] = useState({ vendor: '', vendorPhone: '', invoice: '', total: '', vat: '', payment: 'Cash', paymentStatus: 'paid', paidAmount: '' });
  const [mode, setMode] = useState<'start' | 'manual' | 'review'>('start');
  const [status, setStatus] = useState('Choose one path to add a purchase.');
  const [review, setReview] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<CaptureAsset | null>(null);
  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const scanDocument = async (source: 'camera' | 'gallery') => {
    const asset = await pickBill(source);
    if (!asset) { setStatus('No image selected. You can still enter the purchase manually.'); return; }
    setCaptureOpen(false);
    setPendingDocument(null);
    setScanning(true);
    setStatus('Reading the bill. You will check every field before saving.');
    try {
      const extracted = await scanBill(asset.base64, asset.mimeType);
      setPendingDocument(asset);
      setMode('review');
      setReview(true);
      setForm({ vendor: extracted.vendor, vendorPhone: '', invoice: extracted.invoice, total: String(extracted.total || ''), vat: String(extracted.vat || ''), payment: 'Cash', paymentStatus: 'paid', paidAmount: String(extracted.total || '') });
      setStatus(`Bill read · ${Math.round(extracted.confidence * 100)}% match. Check the fields before saving.`);
    }
    catch (error) {
      setPendingDocument(null);
      setReview(true);
      setStatus(error instanceof Error ? error.message : 'The bill could not be read. Enter it manually.');
    }
    finally {
      setScanning(false);
    }
  };
  const scanDemo = () => { setPendingDocument(null); setMode('review'); setReview(true); setForm({ vendor: 'Bhatbhateni Supermarket', vendorPhone: '', invoice: 'PUR-1042', total: '8200', vat: '1066', payment: 'Cash', paymentStatus: 'paid', paidAmount: '8200' }); setStatus('Demo extraction loaded. Review each field before saving.'); };
  const startManual = () => { setPendingDocument(null); setMode('manual'); setReview(false); setStatus('Manual entry ready.'); };
  const save = async () => {
    if (!form.vendor || !num(form.total))
      return;
    const total = num(form.total);
    const paidAmount = form.paymentStatus === 'paid' ? total : Math.min(total, num(form.paidAmount));
    const bill = { vendor: form.vendor, vendorPhone: form.vendorPhone, invoice: form.invoice || 'PUR-DRAFT', date: new Date().toISOString().slice(0, 10), total, vat: num(form.vat), payment: form.payment, paymentStatus: form.paymentStatus as 'paid' | 'pending' | 'partially_paid', paidAmount, status: 'saved' as const };
    let documentFailed = false;
    if (businessId && pendingDocument) {
      setStatus('Saving the purchase and its original bill…');
      try {
        await saveBillDocument(businessId, pendingDocument.base64, pendingDocument.mimeType, bill);
      }
      catch {
        documentFailed = true;
      }
    }
    addBill(bill);
    setStatus(documentFailed ? 'Purchase saved, but the original image could not be attached.' : businessId ? 'Purchase saved and queued for Supabase.' : 'Purchase saved to this workspace.');
    setPendingDocument(null);
    setMode('start');
    setReview(false);
    setForm({ vendor: '', vendorPhone: '', invoice: '', total: '', vat: '', payment: 'Cash', paymentStatus: 'paid', paidAmount: '' });
    onNavigate('bills');
  };
  return (
    <Screen>
      <Title subtitle="Photograph a supplier bill or enter it by hand.">Purchases</Title>
      <Card style={styles.scanCard}>
        <View style={styles.scanHeading}>
          <View style={styles.bigCamera}><CameraIcon size={31} color={C.paperLight} /></View>
          <View style={styles.scanHeadingCopy}>
            <Text style={styles.panelTitle}>Add a bill with the camera</Text>
            <Text style={styles.panelText}>Take a clear photo. You will check the supplier, total and VAT before anything is saved.</Text>
          </View>
        </View>
        <Button label={scanning ? 'Reading bill…' : 'Open bill camera'} icon={<CameraIcon size={17} color={C.white} />} onPress={() => setCaptureOpen(true)} disabled={scanning} />
        <Pressable accessibilityRole="button" accessibilityLabel="Enter purchase by hand" onPress={startManual} disabled={scanning} style={styles.manualLink}>
          <PlusIcon size={15} color={C.brick} />
          <Text style={styles.manualLinkText}>Enter purchase by hand</Text>
        </Pressable>
        <Text style={styles.status}>{status}</Text>
      </Card>
      {mode !== 'start' && (
        <Card>
          <SectionHeader title={mode === 'review' ? 'Check bill details' : 'Purchase details'} detail="Correct anything that does not match the bill" />
          {review && <Chip tone="gold" icon={<AlertTriangleIcon size={12} color={C.goldDark} />}>Check supplier, totals and VAT before saving</Chip>}
          <View style={styles.fieldRow}>
            <Field label="Supplier name" value={form.vendor} onChangeText={value => update('vendor', value)} placeholder="Supplier or vendor" />
            <Field label="Supplier phone" value={form.vendorPhone} onChangeText={value => update('vendorPhone', value)} keyboardType="phone-pad" placeholder="Optional" />
            <Field label="Invoice number" value={form.invoice} onChangeText={value => update('invoice', value)} placeholder="PUR-0001" />
          </View>
          <View style={styles.fieldRow}>
            <Field label="Grand total" value={form.total} onChangeText={value => update('total', value)} keyboardType="numeric" placeholder="0" />
            <Field label="VAT amount" value={form.vat} onChangeText={value => update('vat', value)} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={styles.fieldRow}>
            <Select label="Payment method" value={form.payment} options={paymentOptions} onChange={value => update('payment', value)} />
            <Select label="Payment status" value={form.paymentStatus} options={paymentStatusOptions} onChange={value => update('paymentStatus', value)} />
            {form.paymentStatus !== 'paid' && <Field label="Paid so far" value={form.paidAmount} onChangeText={value => update('paidAmount', value)} keyboardType="numeric" placeholder="0" />}
          </View>
          <View style={styles.buttonRow}>
            <Button label="Save purchase" onPress={save} disabled={!form.vendor || !num(form.total)} />
            <Button label="Cancel" variant="ghost" onPress={() => { setPendingDocument(null); setMode('start'); setReview(false); }} />
            <Button label="Open bills" variant="ghost" onPress={() => onNavigate('bills')} />
          </View>
        </Card>
      )}
      <CaptureModal visible={captureOpen} title="Photograph a purchase bill" busy={scanning} onClose={() => setCaptureOpen(false)} onChoose={(source) => { void scanDocument(source); }} onDemo={scanDemo} />
    </Screen>
  );
}

export function SalesInvoicePanel({ onNavigate }: { onNavigate: (section: string) => void }) {
  const addSale = useKhataStore.use.addSale();
  const recordStockMovement = useKhataStore.use.recordStockMovement();
  const inventory = useKhataStore.use.inventory();
  const [form, setForm] = useState({ customer: 'Walk-in customer', customerPhone: '', itemId: '', quantity: '1', total: '', payment: 'Cash', paymentStatus: 'paid', paidAmount: '' });
  const [captureOpen, setCaptureOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const selectedItem = inventory.find(item => item.id === form.itemId);
  const quantity = num(form.quantity);
  const calculatedCost = selectedItem ? selectedItem.purchaseCost * quantity : 0;
  const save = () => {
    setSaveError('');
    if (!num(form.total)) return;
    if (selectedItem && quantity > selectedItem.stock) {
      setSaveError(`Only ${selectedItem.stock} ${selectedItem.unit} available. Reduce the quantity before saving.`);
      return;
    }
    const total = num(form.total);
    const saleId = addSale({ customer: form.customer || 'Walk-in customer', customerPhone: form.customerPhone, date: new Date().toISOString().slice(0, 10), total, cost: calculatedCost, payment: form.payment, paymentStatus: form.paymentStatus as 'paid' | 'pending' | 'partially_paid', paidAmount: form.paymentStatus === 'paid' ? total : Math.min(total, num(form.paidAmount)), itemCount: selectedItem ? quantity : 0 });
    if (selectedItem && quantity > 0) recordStockMovement(selectedItem.id, 'outbound', quantity, selectedItem.purchaseCost, 'sale', saleId);
    setForm({ customer: 'Walk-in customer', customerPhone: '', itemId: '', quantity: '1', total: '', payment: 'Cash', paymentStatus: 'paid', paidAmount: '' });
    onNavigate('sales');
  };
  const scanSale = async (source: 'camera' | 'gallery') => {
    const asset = await pickBill(source);
    if (!asset)
      return;
    setCaptureOpen(false);
    setScanning(true);
    setScanStatus('Reading the receipt…');
    try {
      const extracted = await scanBill(asset.base64, asset.mimeType);
      setForm(current => ({ ...current, customer: extracted.vendor || current.customer, total: extracted.total ? String(extracted.total) : current.total, paidAmount: extracted.total ? String(extracted.total) : current.paidAmount }));
      setScanStatus('Receipt read. Check the customer and total before saving.');
    }
    catch {
      setScanStatus('The receipt could not be read. You can still use the form below.');
    }
    finally {
      setScanning(false);
    }
  };
  const itemOptions = [{ label: 'No stock item selected', value: '' }, ...inventory.map(item => ({ label: `${item.name} · ${item.stock} ${item.unit} available`, value: item.id }))];
  return (
    <Screen>
      <Title subtitle="Record a sale from a receipt or enter the details below.">New sale</Title>
      <Pressable accessibilityRole="button" accessibilityLabel="Scan a sales receipt" onPress={() => setCaptureOpen(true)} style={({ pressed }) => [styles.saleScan, pressed && { opacity: 0.75 }]}>
        <View style={styles.saleScanIcon}><CameraIcon size={27} color={C.greenDark} /></View>
        <View style={styles.scanHeadingCopy}>
          <Text style={styles.panelTitle}>{scanning ? 'Reading receipt…' : 'Scan a receipt'}</Text>
          <Text style={styles.panelText}>Use the camera or choose an existing image.</Text>
          {scanStatus && <Text style={styles.status}>{scanStatus}</Text>}
        </View>
        <UploadIcon size={18} color={C.greenDark} />
      </Pressable>
      <Card>
        <SectionHeader title="Sale details" detail="Stock is reduced when you choose an item" />
        <View style={styles.fieldRow}>
          <Field label="Customer" value={form.customer} onChangeText={value => update('customer', value)} placeholder="Walk-in customer" />
          <Field label="Customer phone" value={form.customerPhone} onChangeText={value => update('customerPhone', value)} keyboardType="phone-pad" placeholder="Optional" />
          <Select label="Payment method" value={form.payment} options={paymentOptions} onChange={value => update('payment', value)} />
        </View>
        <View style={styles.fieldRow}>
          <Select label="Stock item (optional)" value={form.itemId} options={itemOptions} onChange={value => update('itemId', value)} />
          <Field label="Quantity" value={form.quantity} onChangeText={value => update('quantity', value)} keyboardType="numeric" placeholder="1" />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Sale total" value={form.total} onChangeText={value => update('total', value)} keyboardType="numeric" placeholder="0" />
          <Select label="Payment status" value={form.paymentStatus} options={paymentStatusOptions} onChange={value => update('paymentStatus', value)} />
          {form.paymentStatus !== 'paid' && <Field label="Paid so far" value={form.paidAmount} onChangeText={value => update('paidAmount', value)} keyboardType="numeric" placeholder="0" />}
          <View style={styles.calculated}>
            <Text style={styles.calculatedLabel}>Item cost</Text>
            <Text style={styles.calculatedValue}>{money(calculatedCost)}</Text>
            <Text style={styles.calculatedHint}>{selectedItem ? `${selectedItem.name} × ${quantity}` : 'Choose a product if this sale affects stock'}</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button label="Save sale" onPress={save} disabled={!num(form.total)} />
          <Button label="View sales" variant="ghost" onPress={() => onNavigate('sales')} />
        </View>
        {saveError && <Text style={styles.error}>{saveError}</Text>}
      </Card>
      <CaptureModal visible={captureOpen} title="Photograph a sales receipt" busy={scanning} onClose={() => setCaptureOpen(false)} onChoose={(source) => { void scanSale(source); }} />
    </Screen>
  );
}

export function SalesPanel({ onNavigate }: { onNavigate: (section: string) => void }) {
  const sales = useKhataStore.use.sales();
  const total = sales.reduce((s, sale) => s + sale.total, 0);
  const profit = sales.reduce((s, sale) => s + sale.total - sale.cost, 0);
  const credit = sales.reduce((s, sale) => {
    const status = sale.paymentStatus || (sale.payment === 'Credit' ? 'pending' : 'paid');
    return s + (status === 'paid' ? 0 : Math.max(0, sale.total - (sale.paidAmount || 0)));
  }, 0);
  return (
    <Screen>
      <Title subtitle="Every sale, payment method and amount in one place.">Sales</Title>
      <View style={styles.statRow}>
        <Stat label="Sales total" value={money(total)} hint={`${sales.length} entries`} tone="brick" />
        <Stat label="Money left after item costs" value={money(profit)} hint={total ? `${((profit / total) * 100).toFixed(1)}% of sales` : 'No sales yet'} tone="green" />
        <Stat label="Customers still owe" value={money(credit)} hint="Credit sales" tone="gold" />
      </View>
      <Card style={styles.registerIntro}>
        <View style={styles.registerIntroCopy}>
          <Text style={styles.panelTitle}>Recent sales</Text>
          <Text style={styles.panelText}>Stock-linked sales also reduce the product quantity.</Text>
        </View>
        <Button label="New sale" icon={<PlusIcon size={16} color={C.white} />} onPress={() => onNavigate('sales-scan')} />
      </Card>
      <SectionHeader title="Sales list" detail="Newest first" />
      {sales.map(sale => (
        <Card key={sale.id}>
          <View style={styles.recordTop}>
            <View style={styles.saleBadge}><TrendingUpIcon size={17} color={C.greenDark} /></View>
            <View style={styles.recordCopy}>
              <Text style={styles.recordTitle}>{sale.customer}</Text>
              <Text style={styles.recordDetail}>
                {sale.date}
                {' '}
                ·
                {' '}
                {sale.payment}
                {' '}
                ·
                {' '}
                {sale.itemCount || 'Walk-in'}
                {' '}
                item
                {sale.itemCount === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.saleAmount}>
              <Text style={styles.recordAmount}>{money(sale.total)}</Text>
              <Text style={styles.saleProfit}>
                After item cost
{money(sale.total - sale.cost)}
              </Text>
            </View>
          </View>
        </Card>
      ))}
      {!sales.length && <Empty text="No sales yet. Create your first sale to start the list." />}
    </Screen>
  );
}

export function ReceivablesPanel() {
  const sales = useKhataStore.use.sales();
  const bills = useKhataStore.use.bills();
  const markSalePaid = useKhataStore.use.markSalePaid();
  const markBillPaid = useKhataStore.use.markBillPaid();
  const receivables = sales.filter(sale => (sale.paymentStatus || (sale.payment === 'Credit' ? 'pending' : 'paid')) !== 'paid' && sale.total - (sale.paidAmount || 0) > 0);
  const payables = bills.filter(bill => (bill.paymentStatus || (bill.payment === 'Credit' ? 'pending' : 'paid')) !== 'paid' && bill.total - (bill.paidAmount || 0) > 0);
  const outstanding = (total: number, paid = 0) => Math.max(0, total - paid);
  const confirmSale = (sale: (typeof sales)[number]) => Alert.alert('Mark sale as paid?', `${sale.customer} · ${money(outstanding(sale.total, sale.paidAmount))}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => markSalePaid(sale.id) }]);
  const confirmBill = (bill: (typeof bills)[number]) => Alert.alert('Mark bill as paid?', `${bill.vendor} · ${money(outstanding(bill.total, bill.paidAmount))}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => markBillPaid(bill.id) }]);
  return (
    <Screen>
      <Title subtitle="Track money customers still owe and supplier bills still due.">Receivables & payables</Title>
      <View style={styles.statRow}>
        <Stat label="Customers owe" value={money(receivables.reduce((sum, sale) => sum + outstanding(sale.total, sale.paidAmount), 0))} hint={`${receivables.length} open sale${receivables.length === 1 ? '' : 's'}`} tone="gold" />
        <Stat label="You owe suppliers" value={money(payables.reduce((sum, bill) => sum + outstanding(bill.total, bill.paidAmount), 0))} hint={`${payables.length} open bill${payables.length === 1 ? '' : 's'}`} tone="brick" />
      </View>
      <SectionHeader title="Customer receivables" detail="Confirm a collection only after the money arrives" />
      {receivables.map(sale => <Card key={sale.id}><View style={styles.recordTop}><View style={styles.recordCopy}><Text style={styles.recordTitle}>{sale.customer}</Text><Text style={styles.recordDetail}>{sale.date} · {sale.payment} · {sale.customerPhone || 'No phone'}</Text></View><View style={styles.saleAmount}><Text style={styles.recordAmount}>{money(outstanding(sale.total, sale.paidAmount))}</Text><Button label="Mark paid" onPress={() => confirmSale(sale)} /></View></View></Card>)}
      {!receivables.length && <Empty text="No customer balances are waiting for collection." />}
      <SectionHeader title="Supplier payables" detail="Bills that still need to be settled" />
      {payables.map(bill => <Card key={bill.id}><View style={styles.recordTop}><View style={styles.recordCopy}><Text style={styles.recordTitle}>{bill.vendor}</Text><Text style={styles.recordDetail}>{bill.invoice} · {bill.date} · {bill.vendorPhone || 'No phone'}</Text></View><View style={styles.saleAmount}><Text style={styles.recordAmount}>{money(outstanding(bill.total, bill.paidAmount))}</Text><Button label="Mark paid" onPress={() => confirmBill(bill)} /></View></View></Card>)}
      {!payables.length && <Empty text="No supplier bills are waiting for payment." />}
    </Screen>
  );
}

export function ExpensesPanel() {
  const expenses = useKhataStore.use.expenses();
  const addExpense = useKhataStore.use.addExpense();
  const [form, setForm] = useState({ category: 'General', description: '', amount: '', payment: 'Cash' });
  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.description || !num(form.amount))
      return; addExpense({ category: form.category, description: form.description, date: new Date().toISOString().slice(0, 10), amount: num(form.amount), payment: form.payment }); setForm({ category: 'General', description: '', amount: '', payment: 'Cash' });
  };
  return (
    <Screen>
      <Title subtitle="Record running business expenses for net profit.">Expenses</Title>
      <View style={styles.statRow}>
        <Stat label="This period" value={money(expenses.reduce((s, e) => s + e.amount, 0))} hint="Operating expenses" tone="red" />
        <Stat label="Entries" value={String(expenses.length)} hint="Every payment tracked" tone="gold" />
      </View>
      <Card>
        <SectionHeader title="Add expense" detail="Keep the description clear for reporting" />
        <View style={styles.fieldRow}>
          <Select label="Category" value={form.category} options={expenseCategoryOptions} onChange={value => update('category', value)} />
          <Field label="Description" value={form.description} onChangeText={value => update('description', value)} placeholder="Rent, utilities, transport" />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Amount" value={form.amount} onChangeText={value => update('amount', value)} keyboardType="numeric" placeholder="0" />
          <Select label="Payment method" value={form.payment} options={paymentOptions} onChange={value => update('payment', value)} />
        </View>
        <Button label="Save expense" onPress={save} disabled={!form.description || !num(form.amount)} />
      </Card>
      <SectionHeader title="Expense register" />
      {expenses.map(expense => <Record key={expense.id} title={expense.description} detail={`${expense.category} · ${expense.date} · ${expense.payment}`} amount={money(expense.amount)} tone="red" />)}
    </Screen>
  );
}

export function LegacyInventoryPanel() {
  const inventory = useKhataStore.use.inventory();
  const saveInventory = useKhataStore.use.saveInventory();
  const removeInventoryImmediately = useKhataStore.use.removeInventory();
  const [editing, setEditing] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'General', unit: 'pcs', stock: '', dailyRequirement: '', reorderLevel: '5', purchaseCost: '', sellingPrice: '', supplier: '' });
  const summary = useMemo(() => ({ value: inventory.reduce((s, item) => s + item.stock * item.purchaseCost, 0), margin: inventory.reduce((s, item) => s + Math.max(0, item.sellingPrice - item.purchaseCost) * item.stock, 0), low: inventory.filter(item => item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7).length }), [inventory]);
  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const reset = () => { setEditing(undefined); setShowForm(false); setForm({ name: '', category: 'General', unit: 'pcs', stock: '', dailyRequirement: '', reorderLevel: '5', purchaseCost: '', sellingPrice: '', supplier: '' }); };
  const edit = (item: InventoryItem) => { setEditing(item.id); setShowForm(true); setForm({ name: item.name, category: item.category, unit: item.unit, stock: String(item.stock), dailyRequirement: String(item.dailyRequirement), reorderLevel: String(item.reorderLevel), purchaseCost: String(item.purchaseCost), sellingPrice: String(item.sellingPrice), supplier: item.supplier }); };
  const save = () => {
    if (!form.name)
      return; saveInventory({ id: editing, name: form.name, category: form.category, unit: form.unit, stock: num(form.stock), dailyRequirement: num(form.dailyRequirement), reorderLevel: num(form.reorderLevel), purchaseCost: num(form.purchaseCost), sellingPrice: num(form.sellingPrice), supplier: form.supplier }); reset();
  };
  const removeInventory = (itemId: string) => {
    const item = inventory.find(candidate => candidate.id === itemId);
    Alert.alert('Delete this product?', `${item?.name || 'This product'} will be removed from stock. This cannot be undone.`, [
      { text: 'Keep product', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeInventoryImmediately(itemId) },
    ]);
  };
  return (
    <Screen>
      <View style={styles.inventoryHeader}>
        <View style={{ flex: 1 }}><Title subtitle="Products first. Reorder pressure and value without wasting the top of the screen.">Inventory</Title></View>
        <IconButton label="Add inventory item" icon={<PlusIcon size={19} color={C.white} />} onPress={() => { setEditing(undefined); setShowForm(true); }} />
      </View>
      <View style={styles.stockStrip}>
        <View>
          <Text style={styles.stockStripLabel}>Stock value</Text>
          <Text style={styles.stockStripValue}>{money(summary.value)}</Text>
        </View>
        <View>
          <Text style={styles.stockStripLabel}>Products</Text>
          <Text style={styles.stockStripValue}>{inventory.length}</Text>
        </View>
        <View>
          <Text style={styles.stockStripLabel}>Low stock</Text>
          <Text style={[styles.stockStripValue, summary.low > 0 && styles.stockStripDanger]}>{summary.low}</Text>
        </View>
      </View>
      <SectionHeader title="Inventory list" detail={`${summary.low} item${summary.low === 1 ? '' : 's'} need attention`} />
      {inventory.map((item) => {
        const low = item.stock <= item.reorderLevel || item.stock <= item.dailyRequirement * 7; return (
          <Card key={item.id} style={low ? styles.lowCard : undefined}>
            <View style={styles.recordTop}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.recordTitle}>{item.name}</Text>
                <Text style={styles.recordDetail}>
                  {item.category}
                  {' '}
                  ·
                  {' '}
                  {item.unit}
                  {' '}
                  ·
                  {' '}
                  {item.supplier || 'No supplier'}
                </Text>
                <Text style={styles.recordDetail}>
                  Stock
                  {item.stock}
                  {' '}
                  ·
                  {item.dailyRequirement ? `${(item.stock / item.dailyRequirement).toFixed(1)} days cover` : 'No daily target'}
                </Text>
              </View>
              <View style={styles.stockRight}>
                <Text style={styles.recordAmount}>{money(item.stock * item.purchaseCost)}</Text>
                <Text style={styles.recordDetail}>
                  Sell
{money(item.sellingPrice)}
                  {' '}
                  /
{item.unit}
                </Text>
                {low && <Chip tone="red">Low stock</Chip>}
              </View>
            </View>
            <View style={styles.buttonRow}>
              <IconButton label="Edit inventory item" icon={<EditIcon size={17} color={C.brick} />} onPress={() => edit(item)} />
              <IconButton label="Delete inventory item" danger icon={<TrashIcon size={17} color={C.red} />} onPress={() => removeInventory(item.id)} />
            </View>
          </Card>
        );
      })}
      {inventory.length === 0 && <Empty text="No inventory yet. Add the products you actually sell." />}
      {showForm && (
        <Card style={styles.formCard}>
          <SectionHeader title={editing ? 'Edit product' : 'Add product'} detail="Cost, price and reorder settings" action={<Button label="Close" variant="ghost" onPress={reset} />} />
          <View style={styles.fieldRow}>
            <Field label="Product name" value={form.name} onChangeText={value => update('name', value)} placeholder="Product name" />
            <Select label="Category" value={form.category} options={inventoryCategoryOptions} onChange={value => update('category', value)} />
            <Select label="Unit" value={form.unit} options={unitOptions} onChange={value => update('unit', value)} />
          </View>
          <View style={styles.fieldRow}>
            <Field label="Current stock" value={form.stock} onChangeText={value => update('stock', value)} keyboardType="numeric" />
            <Field label="Daily requirement" value={form.dailyRequirement} onChangeText={value => update('dailyRequirement', value)} keyboardType="numeric" />
            <Field label="Reorder level" value={form.reorderLevel} onChangeText={value => update('reorderLevel', value)} keyboardType="numeric" />
          </View>
          <View style={styles.fieldRow}>
            <Field label="Purchase cost" value={form.purchaseCost} onChangeText={value => update('purchaseCost', value)} keyboardType="numeric" />
            <Field label="Selling price" value={form.sellingPrice} onChangeText={value => update('sellingPrice', value)} keyboardType="numeric" />
            <Field label="Supplier" value={form.supplier} onChangeText={value => update('supplier', value)} />
          </View>
          <Button label={editing ? 'Update item' : 'Save item'} onPress={save} disabled={!form.name} />
        </Card>
      )}
    </Screen>
  );
}

export function EmployeesPanel() {
  const employees = useKhataStore.use.employees();
  const benefits = useKhataStore.use.benefits();
  const saveEmployee = useKhataStore.use.saveEmployee();
  const removeEmployee = useKhataStore.use.removeEmployee();
  const saveBenefit = useKhataStore.use.saveBenefit();
  const [form, setForm] = useState({ name: '', department: 'General', phone: '', salary: '' });
  const [benefitForm, setBenefitForm] = useState({ employeeId: '', type: 'Bonus', amount: '' });
  const employeeOptions = employees.map(employee => ({ label: employee.name, value: employee.id }));
  const save = () => {
    if (!form.name)
      return; saveEmployee({ name: form.name, department: form.department, phone: form.phone, salary: num(form.salary), status: 'active' }); setForm({ name: '', department: 'General', phone: '', salary: '' });
  };
  return (
    <Screen>
      <Title subtitle="Manage staff, salary, benefits, and payroll expenses.">Employees</Title>
      <View style={styles.statRow}>
        <Stat label="Active staff" value={String(employees.filter(employee => employee.status === 'active').length)} hint="Current team" tone="brick" />
        <Stat label="Benefits ledger" value={money(benefits.reduce((s, benefit) => s + benefit.amount, 0))} hint="Recorded payments" tone="gold" />
      </View>
      <Card>
        <SectionHeader title="Add employee" detail="Directory information and salary" />
        <View style={styles.fieldRow}>
          <Field label="Full name" value={form.name} onChangeText={value => setForm(current => ({ ...current, name: value }))} placeholder="Employee name" />
          <Select label="Department" value={form.department} options={departmentOptions} onChange={value => setForm(current => ({ ...current, department: value }))} />
          <Field label="Phone" value={form.phone} onChangeText={value => setForm(current => ({ ...current, phone: value }))} keyboardType="phone-pad" />
          <Field label="Monthly salary" value={form.salary} onChangeText={value => setForm(current => ({ ...current, salary: value }))} keyboardType="numeric" />
        </View>
        <Button label="Save employee" onPress={save} disabled={!form.name} />
      </Card>
      <Card>
        <SectionHeader title="Add benefit" detail="Paid benefits are part of the employee expense ledger" />
        <View style={styles.fieldRow}>
          <Select label="Employee" value={benefitForm.employeeId || employees[0]?.id || ''} options={employeeOptions} onChange={value => setBenefitForm(current => ({ ...current, employeeId: value }))} />
          <Select label="Benefit type" value={benefitForm.type} options={benefitTypeOptions} onChange={value => setBenefitForm(current => ({ ...current, type: value }))} />
          <Field label="Amount" value={benefitForm.amount} onChangeText={value => setBenefitForm(current => ({ ...current, amount: value }))} keyboardType="numeric" />
        </View>
        <Button
          label="Save benefit"
          onPress={() => {
            if (!num(benefitForm.amount))
              return; saveBenefit({ employeeId: benefitForm.employeeId || employees[0]?.id || '', type: benefitForm.type, amount: num(benefitForm.amount), date: new Date().toISOString().slice(0, 10), payment: 'Bank transfer' }); setBenefitForm({ employeeId: '', type: 'Bonus', amount: '' });
          }}
        />
      </Card>
      <SectionHeader title="Team directory" />
      {employees.map(employee => (
        <Card key={employee.id}>
          <View style={styles.recordTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordTitle}>{employee.name}</Text>
              <Eyebrow>
                {employee.department}
                {' '}
                ·
                {' '}
                {employee.phone || 'No phone'}
                {' '}
                ·
                {' '}
                {employee.status}
              </Eyebrow>
            </View>
            <Text style={styles.recordAmount}>
              {money(employee.salary)}
              {' '}
              / month
            </Text>
          </View>
          <View style={styles.buttonRow}><IconButton label={`Remove ${employee.name}`} danger icon={<TrashIcon size={17} color={C.red} />} onPress={() => removeEmployee(employee.id)} /></View>
        </Card>
      ))}
    </Screen>
  );
}

function CaptureModal({ visible, title, busy, onClose, onChoose, onDemo }: { visible: boolean; title: string; busy: boolean; onClose: () => void; onChoose: (source: 'camera' | 'gallery') => void; onDemo?: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.captureOverlay} onPress={onClose}>
        <Pressable style={styles.captureSheet} onPress={() => {}}>
          <ScrollView contentContainerStyle={styles.captureScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.captureHandle} />
          <View style={styles.captureMark}>
            <CameraIcon size={40} color={C.paperLight} />
            <View style={styles.focusCornerTop} />
            <View style={styles.focusCornerBottom} />
          </View>
          <Text style={styles.captureTitle}>{title}</Text>
          <Text style={styles.captureHelp}>Place the whole receipt on a flat surface with good light. You can correct every field after the photo is read.</Text>
          <View style={styles.captureButtons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Open camera" disabled={busy} onPress={() => onChoose('camera')} style={({ pressed }) => [styles.captureButton, styles.captureButtonPrimary, pressed && { opacity: 0.75 }]}>
              <CameraIcon size={24} color={C.paperLight} />
              <Text style={styles.captureButtonTitleLight}>Open camera</Text>
              <Text style={styles.captureButtonTextLight}>Take a new photo</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Choose a photo" disabled={busy} onPress={() => onChoose('gallery')} style={({ pressed }) => [styles.captureButton, pressed && { opacity: 0.75 }]}>
              <UploadIcon size={24} color={C.brickDark} />
              <Text style={styles.captureButtonTitle}>Choose a photo</Text>
              <Text style={styles.captureButtonText}>Gallery or uploaded file</Text>
            </Pressable>
          </View>
          {onDemo && (
            <Pressable accessibilityRole="button" accessibilityLabel="Use a sample bill" onPress={() => { onClose(); onDemo(); }} style={styles.demoLink}>
              <ReceiptIcon size={15} color={C.muted} />
              <Text style={styles.demoLinkText}>Use a sample bill</Text>
            </Pressable>
          )}
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function IconButton({ label, icon, onPress, danger = false }: { label: string; icon: ReactNode; onPress: () => void; danger?: boolean }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, danger && styles.iconButtonDanger, pressed && { opacity: 0.65 }]}>{icon}</Pressable>; }

function Record({ title, detail, amount, tone }: { title: string; detail: string; amount: string; tone: 'green' | 'gold' | 'red' }) {
  return (
    <Card>
      <View style={styles.recordTop}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.recordTitle}>{title}</Text>
          <Eyebrow>{detail}</Eyebrow>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 5 }}>
          <Text style={[styles.recordAmount, { color: tone === 'green' ? C.greenDark : tone === 'red' ? C.red : '#9C7A2E' }]}>{amount}</Text>
          <Chip tone={tone}>{tone === 'green' ? 'Posted' : tone === 'red' ? 'Expense' : 'Purchase'}</Chip>
        </View>
      </View>
    </Card>
  );
}
function Empty({ text }: { text: string }) { return <Card style={styles.empty}><Text style={styles.panelText}>{text}</Text></Card>; }

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fieldRow: { width: '100%', flexDirection: 'row', alignItems: 'stretch', flexWrap: 'wrap', gap: 10 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 8, borderColor: C.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper },
  iconButtonDanger: { backgroundColor: C.redLight, borderColor: '#DFB4A4' },
  scanCard: { backgroundColor: C.yellowLight, borderColor: C.gold },
  scanHeading: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scanHeadingCopy: { flex: 1, minWidth: 0 },
  bigCamera: { width: 58, height: 58, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.brick, borderColor: C.brickDark, borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  manualLink: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  manualLinkText: { color: C.brick, fontSize: 12, fontWeight: '800', borderBottomColor: C.brick, borderBottomWidth: 1 },
  saleScan: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, borderRadius: 10 },
  saleScanIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderColor: C.green, borderWidth: 1, transform: [{ rotate: '2deg' }] },
  captureOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(44,33,21,0.58)', paddingHorizontal: 12, paddingBottom: 12 },
  captureSheet: { width: '100%', maxWidth: 540, maxHeight: '92%', alignSelf: 'center', backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  captureScroll: { width: '100%', alignItems: 'center', gap: 12, padding: 20, paddingTop: 10 },
  captureHandle: { width: 46, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 4 },
  captureMark: { width: 82, height: 82, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: C.brickDark, borderColor: C.gold, borderWidth: 2, transform: [{ rotate: '-2deg' }] },
  focusCornerTop: { position: 'absolute', width: 55, height: 13, top: 7, borderTopColor: 'rgba(255,255,255,0.35)', borderTopWidth: 1 },
  focusCornerBottom: { position: 'absolute', width: 55, height: 13, bottom: 7, borderBottomColor: 'rgba(255,255,255,0.35)', borderBottomWidth: 1 },
  captureTitle: { color: C.ink, fontSize: 24, lineHeight: 29, fontWeight: '800', fontFamily: 'serif', textAlign: 'center' },
  captureHelp: { color: C.muted, fontSize: 12, lineHeight: 18, maxWidth: 400, textAlign: 'center' },
  captureButtons: { width: '100%', flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  captureButton: { flex: 1, minWidth: 145, minHeight: 102, justifyContent: 'center', padding: 14, backgroundColor: C.yellowLight, borderColor: C.gold, borderWidth: 1, borderRadius: 10 },
  captureButtonPrimary: { backgroundColor: C.brick, borderColor: C.brickDark },
  captureButtonTitle: { color: C.ink, fontSize: 14, fontWeight: '800', marginTop: 8 },
  captureButtonTitleLight: { color: C.paperLight, fontSize: 14, fontWeight: '800', marginTop: 8 },
  captureButtonText: { color: C.muted, fontSize: 10, marginTop: 3 },
  captureButtonTextLight: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 3 },
  demoLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  demoLinkText: { color: C.muted, fontSize: 11, textDecorationLine: 'underline' },
  banner: { backgroundColor: '#FFF8E8', borderColor: '#E4C077' },
  panelTitle: { color: C.ink, fontSize: 18, lineHeight: 24, fontWeight: '800' },
  panelText: { color: C.muted, fontSize: 13, lineHeight: 20 },
  status: { color: C.greenDark, fontSize: 12, fontWeight: '700' },
  error: { color: C.red, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  calculated: { flex: 1, flexBasis: 220, minWidth: 0, justifyContent: 'center', gap: 4, paddingHorizontal: 12, minHeight: 44, backgroundColor: C.greenLight, borderColor: '#C5D6BA', borderWidth: 1, borderRadius: 10 },
  calculatedLabel: { color: C.greenDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  calculatedValue: { color: C.greenDark, fontSize: 16, fontWeight: '900' },
  calculatedHint: { color: C.muted, fontSize: 10 },
  registerIntro: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, backgroundColor: C.bone },
  registerIntroCopy: { flex: 1, minWidth: 220, gap: 5 },
  recordTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  recordCopy: { flex: 1, gap: 4 },
  recordTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  recordDetail: { color: C.muted, fontSize: 11, lineHeight: 16 },
  recordAmount: { color: C.ink, fontSize: 14, fontWeight: '800' },
  saleBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.greenLight, borderColor: C.green, borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  saleAmount: { alignItems: 'flex-end', gap: 4 },
  saleProfit: { color: C.greenDark, fontSize: 10, fontWeight: '700' },
  inventoryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stockStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, backgroundColor: C.ink, padding: 14, borderRadius: 9 },
  stockStripLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  stockStripValue: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 5 },
  stockStripDanger: { color: '#E7C37B' },
  stockRight: { alignItems: 'flex-end', gap: 4 },
  lowCard: { borderColor: C.red },
  formCard: { borderColor: C.gold, backgroundColor: C.paperLight },
  empty: { alignItems: 'center', paddingVertical: 36 },
});
