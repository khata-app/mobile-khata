import type { InventoryItem } from '@/features/khata/types';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BoxIcon, EditIcon, PlusIcon, TrashIcon } from '@/features/khata/icons';
import { useKhataStore } from '@/features/khata/store';
import { Button, C, Card, Chip, Field, Screen, SectionHeader, Select, SERIF, Text, Title } from '@/features/khata/ui';

const money = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;
const num = (value: string) => Number(value) || 0;
const emptyForm = { name: '', category: 'General', unit: 'pcs', stock: '', dailyRequirement: '', reorderLevel: '5', purchaseCost: '', sellingPrice: '', supplier: '' };
const categories = ['General', 'Grains', 'Grocery', 'Dairy', 'Beverages', 'Snacks', 'Cleaning'].map(value => ({ label: value, value }));
const units = ['pcs', 'kg', 'bag', 'bottle', 'packet', 'litre', 'dozen'].map(value => ({ label: value, value }));

export function InventoryPanel() {
  const inventory = useKhataStore.use.inventory();
  const saveInventory = useKhataStore.use.saveInventory();
  const removeInventory = useKhataStore.use.removeInventory();
  const [editing, setEditing] = useState<string>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const summary = useMemo(() => ({
    value: inventory.reduce((sum, item) => sum + item.stock * item.purchaseCost, 0),
    low: inventory.filter(isLow).length,
  }), [inventory]);
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const close = () => { setOpen(false); setEditing(undefined); setForm(emptyForm); };
  const add = () => { setEditing(undefined); setForm(emptyForm); setOpen(true); };
  const edit = (item: InventoryItem) => {
    setEditing(item.id);
    setForm({ name: item.name, category: item.category, unit: item.unit, stock: String(item.stock), dailyRequirement: String(item.dailyRequirement), reorderLevel: String(item.reorderLevel), purchaseCost: String(item.purchaseCost), sellingPrice: String(item.sellingPrice), supplier: item.supplier });
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim())
      return;
    saveInventory({ id: editing, name: form.name.trim(), category: form.category, unit: form.unit, stock: num(form.stock), dailyRequirement: num(form.dailyRequirement), reorderLevel: num(form.reorderLevel), purchaseCost: num(form.purchaseCost), sellingPrice: num(form.sellingPrice), supplier: form.supplier.trim() });
    close();
  };
  const confirmDelete = (item: InventoryItem) => Alert.alert('Delete this product?', `${item.name} will be removed from stock. This cannot be undone.`, [
    { text: 'Keep product', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => removeInventory(item.id) },
  ]);

  return (
    <>
      <Screen>
        <View style={styles.header}>
          <View style={styles.title}><Title subtitle="See quantities first. Tap a product to make changes.">Stock</Title></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Add product" onPress={add} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <PlusIcon size={20} color={C.paperLight} />
            <Text style={styles.addText}>Add product</Text>
          </Pressable>
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Stock value</Text>
            <Text style={styles.summaryValue}>{money(summary.value)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Products</Text>
            <Text style={styles.summaryValue}>{inventory.length}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Running low</Text>
            <Text style={[styles.summaryValue, summary.low > 0 && styles.lowValue]}>{summary.low}</Text>
          </View>
        </View>
        <SectionHeader title="Products" detail={`${inventory.length} in your stock book`} />
        <View style={styles.list}>
          {inventory.map(item => (
            <Pressable key={item.id} onPress={() => edit(item)} style={({ pressed }) => [styles.product, isLow(item) && styles.productLow, pressed && styles.pressed]}>
              <View style={styles.productIcon}><BoxIcon size={23} color={C.brickDark} /></View>
              <View style={styles.productCopy}>
                <View style={styles.productLine}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {isLow(item) && <Chip tone="red">Low</Chip>}
                </View>
                <Text style={styles.productDetail}>
                  {item.category}
                  {' '}
                  ·
                  {' '}
                  {item.supplier || 'No supplier'}
                </Text>
                <Text style={styles.productStock}>
                  {item.stock}
                  {' '}
                  {item.unit}
                  {' '}
                  in stock · Sell
                  {' '}
                  {money(item.sellingPrice)}
                </Text>
              </View>
              <View style={styles.editHint}>
                <EditIcon size={16} color={C.brick} />
                <Text style={styles.editText}>Edit</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {!inventory.length && (
          <Card style={styles.empty}>
            <BoxIcon size={32} color={C.muted} />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Add the ingredients or products you keep in stock.</Text>
            <Button label="Add first product" onPress={add} />
          </Card>
        )}
      </Screen>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{editing ? 'Edit product' : 'Add product'}</Text>
                <Text style={styles.sheetHelp}>Stock, price and reorder details</Text>
              </View>
              {editing && (
                <Pressable accessibilityRole="button" onPress={() => { const item = inventory.find(candidate => candidate.id === editing); if (item) { close(); confirmDelete(item); } }} style={styles.deleteButton}>
                  <TrashIcon size={17} color={C.red} />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              )}
            </View>
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Field label="Product name" value={form.name} onChangeText={value => update('name', value)} placeholder="e.g. Basmati rice" />
              <View style={styles.fieldRow}>
                <Select label="Category" value={form.category} options={categories} onChange={value => update('category', value)} />
                <Select label="Unit" value={form.unit} options={units} onChange={value => update('unit', value)} />
              </View>
              <View style={styles.fieldRow}>
                <Field label="Current stock" value={form.stock} onChangeText={value => update('stock', value)} keyboardType="numeric" placeholder="0" />
                <Field label="Reorder at" value={form.reorderLevel} onChangeText={value => update('reorderLevel', value)} keyboardType="numeric" placeholder="5" />
              </View>
              <View style={styles.fieldRow}>
                <Field label="Used or sold per day" value={form.dailyRequirement} onChangeText={value => update('dailyRequirement', value)} keyboardType="numeric" placeholder="0" />
                <Field label="Supplier" value={form.supplier} onChangeText={value => update('supplier', value)} placeholder="Optional" />
              </View>
              <View style={styles.fieldRow}>
                <Field label="Buying price" value={form.purchaseCost} onChangeText={value => update('purchaseCost', value)} keyboardType="numeric" placeholder="0" />
                <Field label="Selling price" value={form.sellingPrice} onChangeText={value => update('sellingPrice', value)} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={styles.actions}>
                <Button label="Cancel" variant="ghost" onPress={close} />
                <Button label={editing ? 'Save changes' : 'Add product'} onPress={save} disabled={!form.name.trim()} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function isLow(item: InventoryItem) {
  return item.stock <= item.reorderLevel || (item.dailyRequirement > 0 && item.stock <= item.dailyRequirement * 7);
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1 },
  addButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, backgroundColor: C.brick, borderColor: C.brickDark, borderWidth: 1, borderRadius: 8 },
  addText: { color: C.paperLight, fontSize: 12, fontWeight: '800' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 1, padding: 1, backgroundColor: C.ink, borderRadius: 9, overflow: 'hidden' },
  summaryBlock: { flex: 1, minWidth: 105, minHeight: 79, justifyContent: 'center', padding: 12, backgroundColor: '#3A2B1D' },
  summaryLabel: { color: 'rgba(250,243,229,0.62)', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  summaryValue: { color: C.paperLight, fontSize: 18, fontWeight: '800', fontFamily: SERIF, marginTop: 6 },
  lowValue: { color: '#E7C37B' },
  list: { gap: 8 },
  product: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderRadius: 9 },
  productLow: { borderColor: C.red, backgroundColor: '#FDF1EA' },
  productIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: C.yellowLight, borderColor: C.gold, borderWidth: 1, transform: [{ rotate: '-2deg' }] },
  productCopy: { flex: 1, minWidth: 0 },
  productLine: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  productName: { color: C.ink, fontSize: 15, fontWeight: '800' },
  productDetail: { color: C.muted, fontSize: 10, marginTop: 4 },
  productStock: { color: C.greenDark, fontSize: 11, fontWeight: '700', marginTop: 5 },
  editHint: { alignItems: 'center', gap: 3 },
  editText: { color: C.brick, fontSize: 9, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { color: C.ink, fontSize: 18, fontWeight: '800', fontFamily: SERIF },
  emptyText: { color: C.muted, fontSize: 12, textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(44,33,21,0.58)', paddingHorizontal: 10, paddingTop: 36 },
  sheet: { width: '100%', maxWidth: 620, maxHeight: '94%', alignSelf: 'center', backgroundColor: C.paperLight, borderColor: C.border, borderWidth: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 18, paddingTop: 9 },
  handle: { width: 46, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomColor: C.border, borderBottomWidth: 1, paddingBottom: 12 },
  sheetTitle: { color: C.ink, fontSize: 24, fontWeight: '800', fontFamily: SERIF },
  sheetHelp: { color: C.muted, fontSize: 11, marginTop: 3 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 9, backgroundColor: C.redLight, borderColor: '#D9A693', borderWidth: 1, borderRadius: 8 },
  deleteText: { color: C.red, fontSize: 11, fontWeight: '800' },
  form: { gap: 11, paddingVertical: 16 },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap', paddingTop: 4 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});

export default InventoryPanel;
