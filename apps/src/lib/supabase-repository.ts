import { isSupabaseConfigured, supabase } from './supabase';
import type { Benefit, Bill, Company, CompanySetup, Employee, Expense, InventoryItem, Party, PaymentStatus, Sale } from '@/features/khata/types';
import { fromPaisa, toPaisa, validateVoucher, type Account, type PostVoucherInput, type PostedVoucher } from '@/features/accounting/domain';
import type { TaxRate } from '@/features/tax/domain';

type ObjectValue = Record<string, unknown>;

function objectValue(value: unknown): ObjectValue {
  return typeof value === 'object' && value !== null ? value as ObjectValue : {};
}

function rows(value: unknown): ObjectValue[] {
  return Array.isArray(value) ? value.map(objectValue) : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function paisa(value: number) {
  return Math.round(value * 100);
}

function rupees(value: unknown) {
  return numberValue(value) / 100;
}

function relatedName(row: ObjectValue, relation: string) {
  const related = objectValue(row[relation]);
  return stringValue(related.name);
}

function relatedPhone(row: ObjectValue, relation: string) {
  const related = objectValue(row[relation]);
  return stringValue(related.phone);
}

function errorMessage(error: { message?: string } | null) {
  return error?.message ?? 'Supabase request failed';
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in before saving workspace data.');
  return data.user.id;
}

function requiredId(value: unknown, message: string) {
  const id = stringValue(value);
  if (!id) throw new Error(message);
  return id;
}

function isUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function documentHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export type WorkspaceData = {
  company: Company;
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
  parties: Party[];
};

export type WorkspaceMember = { userId: string; name: string; role: 'owner' | 'accountant' | 'staff' | 'auditor' };
export type AuditEvent = { id: string; action: string; entityType: string; entityId: string; createdAt: string };

export async function createWorkspace(setup: CompanySetup) {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before creating a company.');
  const { data, error } = await supabase.rpc('create_workspace', {
    payload: {
      bank: setup.bank,
      businessType: setup.businessType,
      city: setup.city,
      confirmations: setup.confirmations,
      fiscalYear: setup.fiscalYear,
      inventory: setup.inventory,
      name: setup.name,
      openingCash: setup.openingCash,
      openingInventory: setup.openingInventory,
      pan: setup.pan,
      vatRate: setup.vatRate,
    },
  });
  if (error) throw new Error(errorMessage(error));
  return requiredId(data, 'Workspace was not created');
}

export async function updateWorkspace(businessId: string, setup: CompanySetup) {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before updating a company.');
  const { data, error } = await supabase.rpc('update_workspace', {
    payload: {
      bank: setup.bank,
      businessType: setup.businessType,
      city: setup.city,
      confirmations: setup.confirmations,
      fiscalYear: setup.fiscalYear,
      inventory: setup.inventory,
      name: setup.name,
      pan: setup.pan,
      vatRate: setup.vatRate,
    },
    target_business: businessId,
  });
  if (error) throw new Error(errorMessage(error));
  return requiredId(data, 'Workspace was not updated');
}

export async function listAccounts(businessId: string): Promise<Account[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('accounts').select('id, business_id, code, name, account_type, is_system, is_active').eq('business_id', businessId).order('code', { ascending: true });
  if (error) throw new Error(errorMessage(error));
  return rows(data).map(row => ({
    id: requiredId(row.id, 'Account has no id'),
    businessId: stringValue(row.business_id, businessId),
    code: stringValue(row.code),
    name: stringValue(row.name),
    accountType: stringValue(row.account_type, 'asset') as Account['accountType'],
    isSystem: Boolean(row.is_system),
    isActive: row.is_active !== false,
  }));
}

export async function listTaxRates(businessId: string): Promise<TaxRate[]> {
  if (!isSupabaseConfigured) return [];
  const seeded = await supabase.rpc('ensure_default_tax_rates', { target_business: businessId });
  if (seeded.error) throw new Error(errorMessage(seeded.error));
  const { data, error } = await supabase.from('tax_rates').select('code, name, rate, kind').eq('business_id', businessId).eq('is_active', true).order('kind').order('rate');
  if (error) throw new Error(errorMessage(error));
  return rows(data).map(row => ({ code: stringValue(row.code), name: stringValue(row.name), rate: numberValue(row.rate), kind: stringValue(row.kind, 'vat') as TaxRate['kind'] }));
}

export async function upsertTaxRate(businessId: string, taxRate: TaxRate) {
  if (!isSupabaseConfigured) return taxRate;
  const { data, error } = await supabase.from('tax_rates').upsert({ business_id: businessId, code: taxRate.code, name: taxRate.name, kind: taxRate.kind, rate: taxRate.rate, is_active: true }, { onConflict: 'business_id,code' }).select('code, name, rate, kind').single();
  if (error) throw new Error(errorMessage(error));
  if (taxRate.kind === 'vat') {
    const settings = await supabase.from('business_settings').update({ vat_rate: taxRate.rate }).eq('business_id', businessId);
    if (settings.error) throw new Error(errorMessage(settings.error));
  }
  const row = objectValue(data);
  return { code: stringValue(row.code), name: stringValue(row.name), rate: numberValue(row.rate), kind: stringValue(row.kind, 'vat') as TaxRate['kind'] };
}

export async function listWorkspaceMembers(businessId: string): Promise<WorkspaceMember[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('business_memberships').select('user_id, role, profiles(display_name)').eq('business_id', businessId).order('created_at');
  if (error) throw new Error(errorMessage(error));
  return rows(data).map(row => ({ userId: stringValue(row.user_id), name: stringValue(objectValue(row.profiles).display_name, 'Workspace member'), role: stringValue(row.role, 'staff') as WorkspaceMember['role'] }));
}

export async function listAuditEvents(businessId: string): Promise<AuditEvent[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('audit_events').select('id, action, entity_type, entity_id, created_at').eq('business_id', businessId).order('created_at', { ascending: false }).limit(20);
  if (error) throw new Error(errorMessage(error));
  return rows(data).map(row => ({ id: stringValue(row.id), action: stringValue(row.action), entityType: stringValue(row.entity_type), entityId: stringValue(row.entity_id), createdAt: stringValue(row.created_at) }));
}

export async function exportWorkspaceBackup(businessId: string) {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before exporting a backup.');
  const { data, error } = await supabase.rpc('export_workspace_backup', { target_business: businessId });
  if (error) throw new Error(errorMessage(error));
  return objectValue(data);
}

export async function migrateLegacyRecordsToLedger(businessId: string) {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before migrating the ledger.');
  const { data, error } = await supabase.rpc('migrate_legacy_records_to_ledger', { target_business: businessId });
  if (error) throw new Error(errorMessage(error));
  return numberValue(data);
}

export async function postVoucher(input: PostVoucherInput): Promise<PostedVoucher> {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before posting a voucher.');
  validateVoucher(input);
  const { data, error } = await supabase.rpc('post_voucher', {
    payload: {
      businessId: input.businessId,
      voucherType: input.voucherType,
      transactionDate: input.transactionDate,
      idempotencyKey: input.idempotencyKey,
      narration: input.narration,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      lines: input.lines.map(line => ({
        accountId: line.accountId,
        debitPaisa: toPaisa(line.debit),
        creditPaisa: toPaisa(line.credit),
        description: line.description,
      })),
    },
  });
  if (error) throw new Error(errorMessage(error));
  return { id: requiredId(data, 'Voucher was not posted'), voucherType: input.voucherType, transactionDate: input.transactionDate, status: 'posted' };
}

export async function reverseVoucher(businessId: string, voucherId: string, transactionDate: string, idempotencyKey: string) {
  if (!isSupabaseConfigured) throw new Error('Configure Supabase before reversing a voucher.');
  const { data, error } = await supabase.rpc('reverse_voucher', { payload: { businessId, voucherId, transactionDate, idempotencyKey } });
  if (error) throw new Error(errorMessage(error));
  return requiredId(data, 'Voucher was not reversed');
}

export { fromPaisa };

export async function loadWorkspace(): Promise<WorkspaceData | null> {
  if (!isSupabaseConfigured) return null;
  const membershipResult = await supabase
    .from('business_memberships')
    .select('business_id, businesses(id, name, business_type, currency_code, pan_number, business_addresses(city), business_settings(fiscal_year_label, vat_rate))')
    .order('created_at', { ascending: true })
    .limit(1);
  if (membershipResult.error) throw new Error(errorMessage(membershipResult.error));
  const membership = objectValue(rows(membershipResult.data)[0]);
  const business = objectValue(membership.businesses);
  const businessId = stringValue(membership.business_id) || stringValue(business.id);
  if (!businessId) return null;

  const address = objectValue(business.business_addresses);
  const settings = objectValue(business.business_settings);
  const company: Company = {
    id: businessId,
    name: stringValue(business.name, 'My business'),
    businessType: stringValue(business.business_type, 'Retail'),
    currency: stringValue(business.currency_code, 'NPR'),
    pan: stringValue(business.pan_number),
    city: stringValue(address.city, 'Kathmandu'),
    fiscalYear: stringValue(settings.fiscal_year_label, '2082/83'),
    vatRate: numberValue(settings.vat_rate, 13),
  };

  const [billsResult, inventoryResult, salesResult, expensesResult, employeesResult, benefitsResult, vendorsResult, customersResult] = await Promise.all([
    supabase.from('purchase_bills').select('id, invoice_number, invoice_date, total_paisa, vat_paisa, payment_method, status, payment_status, paid_paisa, vendors(name, phone)').eq('business_id', businessId).order('invoice_date', { ascending: false }),
    supabase.from('inventory_items').select('id, name, category, unit, stock_quantity, daily_requirement, reorder_level, purchase_cost_paisa, selling_price_paisa, vendors(name, phone)').eq('business_id', businessId).order('created_at', { ascending: false }),
    supabase.from('sales').select('id, sale_date, total_paisa, cost_paisa, payment_method, item_count, payment_status, paid_paisa, payment_received_date, payment_received_method, payer_phone, customers(name, phone)').eq('business_id', businessId).order('sale_date', { ascending: false }),
    supabase.from('expenses').select('id, category, description, expense_date, amount_paisa, payment_method, tds_rate, tds_paisa').eq('business_id', businessId).order('expense_date', { ascending: false }),
    supabase.from('employees').select('id, name, department, phone, status, salary_paisa').eq('business_id', businessId).order('created_at', { ascending: false }),
    supabase.from('employee_benefits').select('id, employee_id, benefit_type, amount_paisa, benefit_date, payment_method').eq('business_id', businessId).order('benefit_date', { ascending: false }),
    supabase.from('vendors').select('id, name, phone').eq('business_id', businessId).order('name'),
    supabase.from('customers').select('id, name, phone').eq('business_id', businessId).order('name'),
  ]);
  const results = [billsResult, inventoryResult, salesResult, expensesResult, employeesResult, benefitsResult, vendorsResult, customersResult];
  const failed = results.find(result => result.error);
  if (failed?.error) throw new Error(errorMessage(failed.error));

  return {
    company,
    bills: rows(billsResult.data).map(row => ({
      id: stringValue(row.id),
      vendor: relatedName(row, 'vendors'),
      invoice: stringValue(row.invoice_number),
      date: stringValue(row.invoice_date),
      total: rupees(row.total_paisa),
      vat: rupees(row.vat_paisa),
      payment: stringValue(row.payment_method, 'Cash'),
      status: stringValue(row.status, 'saved') === 'review' ? 'review' : 'saved',
      paymentStatus: stringValue(row.payment_status, 'paid') as PaymentStatus,
      paidAmount: rupees(row.paid_paisa),
      vendorPhone: relatedPhone(row, 'vendors'),
    })),
    inventory: rows(inventoryResult.data).map(row => ({
      id: stringValue(row.id),
      name: stringValue(row.name),
      category: stringValue(row.category, 'General'),
      unit: stringValue(row.unit, 'pcs'),
      stock: numberValue(row.stock_quantity),
      dailyRequirement: numberValue(row.daily_requirement),
      reorderLevel: numberValue(row.reorder_level),
      purchaseCost: rupees(row.purchase_cost_paisa),
      sellingPrice: rupees(row.selling_price_paisa),
      supplier: relatedName(row, 'vendors'),
      supplierPhone: relatedPhone(row, 'vendors'),
    })),
    sales: rows(salesResult.data).map(row => ({
      id: stringValue(row.id),
      customer: relatedName(row, 'customers') || 'Walk-in customer',
      date: stringValue(row.sale_date),
      total: rupees(row.total_paisa),
      cost: rupees(row.cost_paisa),
      payment: stringValue(row.payment_method, 'Cash'),
      itemCount: numberValue(row.item_count),
      paymentStatus: stringValue(row.payment_status, 'paid') as PaymentStatus,
      paidAmount: rupees(row.paid_paisa),
      customerPhone: relatedPhone(row, 'customers'),
      paymentReceivedDate: stringValue(row.payment_received_date),
      paymentReceivedMethod: stringValue(row.payment_received_method),
      payerPhone: stringValue(row.payer_phone),
    })),
    expenses: rows(expensesResult.data).map(row => ({
      id: stringValue(row.id),
      category: stringValue(row.category, 'General'),
      description: stringValue(row.description),
      date: stringValue(row.expense_date),
      amount: rupees(row.amount_paisa),
      payment: stringValue(row.payment_method, 'Cash'),
      tdsRate: numberValue(row.tds_rate),
      tdsAmount: rupees(row.tds_paisa),
    })),
    employees: rows(employeesResult.data).map(row => ({
      id: stringValue(row.id),
      name: stringValue(row.name),
      department: stringValue(row.department, 'General'),
      phone: stringValue(row.phone),
      status: stringValue(row.status, 'active') === 'inactive' ? 'inactive' : 'active',
      salary: rupees(row.salary_paisa),
    })),
    benefits: rows(benefitsResult.data).map(row => ({
      id: stringValue(row.id),
      employeeId: stringValue(row.employee_id),
      type: stringValue(row.benefit_type),
      amount: rupees(row.amount_paisa),
      date: stringValue(row.benefit_date),
      payment: stringValue(row.payment_method, 'Cash'),
    })),
    parties: [
      ...rows(vendorsResult.data).map(row => ({ id: stringValue(row.id), name: stringValue(row.name), type: 'supplier' as const, phone: stringValue(row.phone) })),
      ...rows(customersResult.data).map(row => ({ id: stringValue(row.id), name: stringValue(row.name), type: 'customer' as const, phone: stringValue(row.phone) })),
    ],
  } satisfies WorkspaceData;
}

async function upsertName(table: 'vendors' | 'customers', businessId: string, name: string, phone?: string) {
  const cleanName = name.trim();
  if (!cleanName) return null;
  const { data, error } = await supabase.from(table).upsert({ business_id: businessId, name: cleanName, ...(phone?.trim() ? { phone: phone.trim() } : {}) }, { onConflict: 'business_id,name' }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return requiredId(objectValue(data).id, `${table} was not saved`);
}

export async function upsertParty(businessId: string, party: Omit<Party, 'id'> & { id?: string }) {
  const table = party.type === 'supplier' ? 'vendors' : 'customers';
  const id = await upsertName(table, businessId, party.name, party.phone);
  return { ...party, id: id || party.id || '' };
}

export async function removeParty(businessId: string, party: Party) {
  const table = party.type === 'supplier' ? 'vendors' : 'customers';
  const { error } = await supabase.from(table).delete().eq('business_id', businessId).eq('id', party.id);
  if (error) throw new Error(errorMessage(error));
}

export async function insertBill(businessId: string, bill: Omit<Bill, 'id'>) {
  const vendorId = await upsertName('vendors', businessId, bill.vendor, bill.vendorPhone);
  const { data, error } = await supabase.from('purchase_bills').insert({
    business_id: businessId,
    vendor_id: vendorId,
    invoice_number: bill.invoice,
    invoice_date: bill.date,
    total_paisa: paisa(bill.total),
    vat_paisa: paisa(bill.vat),
    payment_method: bill.payment,
    status: bill.status,
    payment_status: bill.paymentStatus || 'paid',
    paid_paisa: paisa(bill.paidAmount ?? (bill.paymentStatus === 'paid' ? bill.total : 0)),
    created_by: await currentUserId(),
  }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return { ...bill, id: requiredId(objectValue(data).id, 'Purchase was not saved') };
}

export async function insertSale(businessId: string, sale: Omit<Sale, 'id'>) {
  const customerId = await upsertName('customers', businessId, sale.customer, sale.customerPhone);
  const { data, error } = await supabase.from('sales').insert({
    business_id: businessId,
    customer_id: customerId,
    sale_date: sale.date,
    total_paisa: paisa(sale.total),
    cost_paisa: paisa(sale.cost),
    payment_method: sale.payment,
    item_count: sale.itemCount,
    payment_status: sale.paymentStatus || 'paid',
    paid_paisa: paisa(sale.paidAmount ?? (sale.paymentStatus === 'paid' ? sale.total : 0)),
    payment_received_date: sale.paymentReceivedDate || null,
    payment_received_method: sale.paymentReceivedMethod || null,
    payer_phone: sale.payerPhone || null,
    created_by: await currentUserId(),
  }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return { ...sale, id: requiredId(objectValue(data).id, 'Sale was not saved') };
}

export async function insertExpense(businessId: string, expense: Omit<Expense, 'id'>) {
  const { data, error } = await supabase.from('expenses').insert({
    business_id: businessId,
    category: expense.category,
    description: expense.description,
    expense_date: expense.date,
    amount_paisa: paisa(expense.amount),
    payment_method: expense.payment,
    tds_rate: expense.tdsRate || 0,
    tds_paisa: paisa(expense.tdsAmount || 0),
    created_by: await currentUserId(),
  }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return { ...expense, id: requiredId(objectValue(data).id, 'Expense was not saved') };
}

export async function upsertInventory(businessId: string, item: Omit<InventoryItem, 'id'> & { id?: string }) {
  const supplierId = await upsertName('vendors', businessId, item.supplier, item.supplierPhone);
  const payload = {
    business_id: businessId,
    supplier_id: supplierId,
    name: item.name,
    category: item.category,
    unit: item.unit,
    stock_quantity: item.stock,
    daily_requirement: item.dailyRequirement,
    reorder_level: item.reorderLevel,
    purchase_cost_paisa: paisa(item.purchaseCost),
    selling_price_paisa: paisa(item.sellingPrice),
  };
  const query = isUuid(item.id)
    ? supabase.from('inventory_items').update(payload).eq('id', item.id).eq('business_id', businessId).select('id').single()
    : supabase.from('inventory_items').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(errorMessage(error));
  return { ...item, id: requiredId(objectValue(data).id, 'Inventory item was not saved') };
}

export async function removeInventory(businessId: string, id: string) {
  const { error } = await supabase.from('inventory_items').delete().eq('business_id', businessId).eq('id', id);
  if (error) throw new Error(errorMessage(error));
}

export async function updateSalePayment(businessId: string, saleId: string, paymentStatus: PaymentStatus, paidAmount: number, paymentReceivedDate: string, paymentReceivedMethod: string, payerPhone: string) {
  const { data, error } = await supabase.from('sales').update({ payment_status: paymentStatus, paid_paisa: paisa(paidAmount), payment_received_date: paymentReceivedDate || null, payment_received_method: paymentReceivedMethod || null, payer_phone: payerPhone || null }).eq('business_id', businessId).eq('id', saleId).select('id, payment_status, paid_paisa, payment_received_date, payment_received_method, payer_phone').single();
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function updateBillPayment(businessId: string, billId: string, paymentStatus: PaymentStatus, paidAmount: number) {
  const { data, error } = await supabase.from('purchase_bills').update({ payment_status: paymentStatus, paid_paisa: paisa(paidAmount) }).eq('business_id', businessId).eq('id', billId).select('id, payment_status, paid_paisa').single();
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function applyStockMovement(businessId: string, inventoryItemId: string, movementType: 'inbound' | 'outbound' | 'adjustment', quantity: number, unitCost: number, sourceType: string, sourceId: string) {
  const { data, error } = await supabase.rpc('apply_stock_movement', { payload: { businessId, inventoryItemId, movementType, quantity, unitCostPaisa: paisa(unitCost), sourceType, sourceId } });
  if (error) throw new Error(errorMessage(error));
  return requiredId(data, 'Stock movement was not saved');
}

export async function upsertEmployee(businessId: string, employee: Omit<Employee, 'id'> & { id?: string }) {
  const payload = { business_id: businessId, name: employee.name, department: employee.department, phone: employee.phone, status: employee.status, salary_paisa: paisa(employee.salary) };
  const query = isUuid(employee.id)
    ? supabase.from('employees').update(payload).eq('id', employee.id).eq('business_id', businessId).select('id').single()
    : supabase.from('employees').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(errorMessage(error));
  return { ...employee, id: requiredId(objectValue(data).id, 'Employee was not saved') };
}

export async function removeEmployee(businessId: string, id: string) {
  const { error } = await supabase.from('employees').delete().eq('business_id', businessId).eq('id', id);
  if (error) throw new Error(errorMessage(error));
}

export async function insertBenefit(businessId: string, benefit: Omit<Benefit, 'id'> & { id?: string }) {
  const payload = { business_id: businessId, employee_id: benefit.employeeId, benefit_type: benefit.type, amount_paisa: paisa(benefit.amount), benefit_date: benefit.date, payment_method: benefit.payment, created_by: await currentUserId() };
  const query = isUuid(benefit.id)
    ? supabase.from('employee_benefits').update(payload).eq('id', benefit.id).eq('business_id', businessId).select('id').single()
    : supabase.from('employee_benefits').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(errorMessage(error));
  return { ...benefit, id: requiredId(objectValue(data).id, 'Benefit was not saved') };
}

export async function seedDemoWorkspace(businessId: string, seed: Omit<WorkspaceData, 'company'>): Promise<Omit<WorkspaceData, 'company'>> {
  const [bills, inventory, sales, expenses] = await Promise.all([
    Promise.all(seed.bills.map(bill => insertBill(businessId, bill))),
    Promise.all(seed.inventory.map(item => upsertInventory(businessId, item))),
    Promise.all(seed.sales.map(sale => insertSale(businessId, sale))),
    Promise.all(seed.expenses.map(expense => insertExpense(businessId, expense))),
  ]);
  const employees = await Promise.all(seed.employees.map(employee => upsertEmployee(businessId, employee)));
  const employeeIds = new Map(seed.employees.map((employee, index) => [employee.id, employees[index].id]));
  const benefits = await Promise.all(seed.benefits.map(benefit => {
    const employeeId = employeeIds.get(benefit.employeeId);
    return employeeId ? insertBenefit(businessId, { ...benefit, employeeId }) : Promise.resolve(benefit);
  }));
  const parties = await Promise.all(seed.parties.map(party => upsertParty(businessId, party)));
  return { bills, inventory, sales, expenses, employees, benefits, parties };
}

export async function saveBillDocument(businessId: string, imageBase64: string, mimeType: string, extracted: Record<string, unknown>) {
  const hash = documentHash(imageBase64);
  const duplicate = await supabase.from('bill_documents').select('id').eq('business_id', businessId).eq('document_hash', hash).maybeSingle();
  if (duplicate.error) throw new Error(errorMessage(duplicate.error));
  if (duplicate.data) throw new Error('This bill image is already in the review queue. Check it before uploading again.');
  const extension = mimeType.split('/')[1] || 'jpg';
  const storagePath = `${businessId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const blob = await fetch(`data:${mimeType};base64,${imageBase64}`).then(response => response.blob());
  const upload = await supabase.storage.from('bill-documents').upload(storagePath, blob, { contentType: mimeType, upsert: false });
  if (upload.error) throw new Error(errorMessage(upload.error));
  const { error } = await supabase.from('bill_documents').insert({
    business_id: businessId,
    storage_path: storagePath,
    mime_type: mimeType,
    extraction_status: 'review',
    extracted_fields: extracted,
    confidence: typeof extracted.confidence === 'number' ? extracted.confidence : null,
    document_hash: hash,
    created_by: await currentUserId(),
  });
  if (error) throw new Error(errorMessage(error));
  return storagePath;
}

export async function scanBill(imageBase64: string, mimeType: string) {
  const { data, error } = await supabase.functions.invoke('scan-bill', { body: { imageBase64, mimeType } });
  if (error) throw new Error(errorMessage(error));
  const extracted = objectValue(objectValue(data).extracted);
  return {
    vendor: stringValue(extracted.vendor),
    invoice: stringValue(extracted.invoice),
    date: stringValue(extracted.date),
    total: numberValue(extracted.total),
    vat: numberValue(extracted.vat),
    confidence: numberValue(extracted.confidence),
    lineItems: rows(extracted.lineItems).map(item => ({ description: stringValue(item.description, 'Line item'), quantity: numberValue(item.quantity, 1), unitPrice: numberValue(item.unitPrice), amount: numberValue(item.amount) })),
  };
}
