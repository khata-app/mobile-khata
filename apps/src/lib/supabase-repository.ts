import { isSupabaseConfigured, supabase } from './supabase';
import type { Benefit, Bill, Company, CompanySetup, Employee, Expense, InventoryItem, Sale } from '@/features/khata/types';

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

export type WorkspaceData = {
  company: Company;
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
};

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

  const [billsResult, inventoryResult, salesResult, expensesResult, employeesResult, benefitsResult] = await Promise.all([
    supabase.from('purchase_bills').select('id, invoice_number, invoice_date, total_paisa, vat_paisa, payment_method, status, vendors(name)').eq('business_id', businessId).order('invoice_date', { ascending: false }),
    supabase.from('inventory_items').select('id, name, category, unit, stock_quantity, daily_requirement, reorder_level, purchase_cost_paisa, selling_price_paisa, vendors(name)').eq('business_id', businessId).order('created_at', { ascending: false }),
    supabase.from('sales').select('id, sale_date, total_paisa, cost_paisa, payment_method, item_count, customers(name)').eq('business_id', businessId).order('sale_date', { ascending: false }),
    supabase.from('expenses').select('id, category, description, expense_date, amount_paisa, payment_method').eq('business_id', businessId).order('expense_date', { ascending: false }),
    supabase.from('employees').select('id, name, department, phone, status, salary_paisa').eq('business_id', businessId).order('created_at', { ascending: false }),
    supabase.from('employee_benefits').select('id, employee_id, benefit_type, amount_paisa, benefit_date, payment_method').eq('business_id', businessId).order('benefit_date', { ascending: false }),
  ]);
  const results = [billsResult, inventoryResult, salesResult, expensesResult, employeesResult, benefitsResult];
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
    })),
    sales: rows(salesResult.data).map(row => ({
      id: stringValue(row.id),
      customer: relatedName(row, 'customers') || 'Walk-in customer',
      date: stringValue(row.sale_date),
      total: rupees(row.total_paisa),
      cost: rupees(row.cost_paisa),
      payment: stringValue(row.payment_method, 'Cash'),
      itemCount: numberValue(row.item_count),
    })),
    expenses: rows(expensesResult.data).map(row => ({
      id: stringValue(row.id),
      category: stringValue(row.category, 'General'),
      description: stringValue(row.description),
      date: stringValue(row.expense_date),
      amount: rupees(row.amount_paisa),
      payment: stringValue(row.payment_method, 'Cash'),
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
  } satisfies WorkspaceData;
}

async function upsertName(table: 'vendors' | 'customers', businessId: string, name: string) {
  const cleanName = name.trim();
  if (!cleanName) return null;
  const { data, error } = await supabase.from(table).upsert({ business_id: businessId, name: cleanName }, { onConflict: 'business_id,name' }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return requiredId(objectValue(data).id, `${table} was not saved`);
}

export async function insertBill(businessId: string, bill: Omit<Bill, 'id'>) {
  const vendorId = await upsertName('vendors', businessId, bill.vendor);
  const { data, error } = await supabase.from('purchase_bills').insert({
    business_id: businessId,
    vendor_id: vendorId,
    invoice_number: bill.invoice,
    invoice_date: bill.date,
    total_paisa: paisa(bill.total),
    vat_paisa: paisa(bill.vat),
    payment_method: bill.payment,
    status: bill.status,
    created_by: await currentUserId(),
  }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return { ...bill, id: requiredId(objectValue(data).id, 'Purchase was not saved') };
}

export async function insertSale(businessId: string, sale: Omit<Sale, 'id'>) {
  const customerId = await upsertName('customers', businessId, sale.customer);
  const { data, error } = await supabase.from('sales').insert({
    business_id: businessId,
    customer_id: customerId,
    sale_date: sale.date,
    total_paisa: paisa(sale.total),
    cost_paisa: paisa(sale.cost),
    payment_method: sale.payment,
    item_count: sale.itemCount,
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
    created_by: await currentUserId(),
  }).select('id').single();
  if (error) throw new Error(errorMessage(error));
  return { ...expense, id: requiredId(objectValue(data).id, 'Expense was not saved') };
}

export async function upsertInventory(businessId: string, item: Omit<InventoryItem, 'id'> & { id?: string }) {
  const supplierId = await upsertName('vendors', businessId, item.supplier);
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
  return { bills, inventory, sales, expenses, employees, benefits };
}

export async function saveBillDocument(businessId: string, imageBase64: string, mimeType: string, extracted: Record<string, unknown>) {
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
  };
}
