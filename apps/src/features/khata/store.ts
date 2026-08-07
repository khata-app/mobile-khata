import { create } from 'zustand';
import { createSelectors } from '@/lib/utils';
import { storage } from '@/lib/storage';
import {
  createWorkspace,
  insertBenefit,
  insertBill,
  insertExpense,
  insertSale,
  loadWorkspace,
  removeEmployee as removeRemoteEmployee,
  removeInventory as removeRemoteInventory,
  seedDemoWorkspace,
  updateWorkspace,
  upsertEmployee,
  upsertInventory,
} from '@/lib/supabase-repository';
import type { Bill, Benefit, Company, CompanySetup, Employee, Expense, InventoryItem, Sale } from './types';

const DEMO_BUSINESS_ID = 'demo-company';
const today = new Date().toISOString().slice(0, 10);

const defaultCompany: Company = {
  id: DEMO_BUSINESS_ID,
  name: 'Mero Kirana Pasal',
  businessType: 'Retail',
  currency: 'NPR',
  pan: '604812345',
  city: 'Kathmandu',
  fiscalYear: '2082/83',
};

const initialBills: Bill[] = [
  { id: 'bill-1', vendor: 'Bhatbhateni Supermarket', invoice: 'PUR-1041', date: today, total: 8200, vat: 1066, payment: 'Cash', status: 'saved' },
  { id: 'bill-2', vendor: 'Shree Suppliers', invoice: 'PUR-1038', date: '2026-07-31', total: 136200, vat: 17706, payment: 'Bank transfer', status: 'saved' },
];

const initialInventory: InventoryItem[] = [
  { id: 'item-1', name: 'Rice 25kg', category: 'Grains', unit: 'bag', stock: 18, dailyRequirement: 2, reorderLevel: 10, purchaseCost: 2100, sellingPrice: 2450, supplier: 'Shree Suppliers' },
  { id: 'item-2', name: 'Sunflower oil 1L', category: 'Grocery', unit: 'bottle', stock: 42, dailyRequirement: 5, reorderLevel: 20, purchaseCost: 210, sellingPrice: 245, supplier: 'Bhatbhateni Supermarket' },
  { id: 'item-3', name: 'Noodles', category: 'Grocery', unit: 'packet', stock: 12, dailyRequirement: 4, reorderLevel: 15, purchaseCost: 26, sellingPrice: 35, supplier: 'Local distributor' },
];

const initialSales: Sale[] = [
  { id: 'sale-1', customer: 'Walk-in customer', date: today, total: 12500, cost: 7800, payment: 'Cash', itemCount: 8 },
  { id: 'sale-2', customer: 'Himalayan Cafe', date: '2026-07-31', total: 48000, cost: 30500, payment: 'Credit', itemCount: 14 },
];

const initialExpenses: Expense[] = [
  { id: 'expense-1', category: 'Rent', description: 'Shop rent', date: '2026-07-31', amount: 25000, payment: 'Bank transfer' },
  { id: 'expense-2', category: 'Utilities', description: 'Electricity and internet', date: today, amount: 13750, payment: 'Cash' },
];

const initialEmployees: Employee[] = [
  { id: 'employee-1', name: 'Sita Thapa', department: 'Shop floor', phone: '98XXXXXXXX', status: 'active', salary: 22000 },
  { id: 'employee-2', name: 'Bikash Gurung', department: 'Delivery', phone: '97XXXXXXXX', status: 'active', salary: 18000 },
];

const initialBenefits: Benefit[] = [
  { id: 'benefit-1', employeeId: 'employee-1', type: 'Dashain allowance', amount: 10000, date: '2026-07-20', payment: 'Bank transfer' },
];

type Snapshot = {
  company: Company;
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
};

type KhataState = Snapshot & {
  businessId: string | null;
  hydrated: boolean;
  syncing: boolean;
  syncError: string | null;
  hydrate: () => Promise<void>;
  saveCompanySetup: (setup: CompanySetup) => Promise<boolean>;
  setCompany: (company: Company) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  saveInventory: (item: Omit<InventoryItem, 'id'> & { id?: string }) => void;
  removeInventory: (id: string) => void;
  saveEmployee: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
  removeEmployee: (id: string) => void;
  saveBenefit: (benefit: Omit<Benefit, 'id'> & { id?: string }) => void;
};

function persist(state: KhataState) {
  const snapshot: Snapshot = {
    company: state.company,
    bills: state.bills,
    inventory: state.inventory,
    sales: state.sales,
    expenses: state.expenses,
    employees: state.employees,
    benefits: state.benefits,
  };
  storage.set('khata.workspace.v2', JSON.stringify(snapshot));
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isRemoteBusiness(businessId: string | null): businessId is string {
  return Boolean(businessId && businessId !== DEMO_BUSINESS_ID);
}

function snapshotFromRaw(raw: string | undefined): Snapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    if (!parsed.company || !Array.isArray(parsed.bills) || !Array.isArray(parsed.inventory)) return null;
    return {
      company: parsed.company,
      bills: parsed.bills,
      inventory: parsed.inventory,
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
    };
  } catch {
    return null;
  }
}

function markSyncFailure(message: string) {
  const cleanMessage = message.toLowerCase().includes('fetch') ? 'Supabase is unavailable; your entry stays on this device.' : message;
  _useKhataStore.setState({ syncing: false, syncError: cleanMessage });
}

function runSync(task: () => Promise<void>) {
  _useKhataStore.setState({ syncing: true, syncError: null });
  void task().catch(error => {
    markSyncFailure(error instanceof Error ? error.message : 'Supabase sync failed');
  }).finally(() => {
    if (_useKhataStore.getState().syncing) _useKhataStore.setState({ syncing: false });
  });
}

const _useKhataStore = create<KhataState>((set, get) => ({
  company: defaultCompany,
  bills: initialBills,
  inventory: initialInventory,
  sales: initialSales,
  expenses: initialExpenses,
  employees: initialEmployees,
  benefits: initialBenefits,
  businessId: null,
  hydrated: false,
  syncing: false,
  syncError: null,
  hydrate: async () => {
    const local = snapshotFromRaw(storage.getString('khata.workspace.v2'));
    if (local) set({ ...local, businessId: local.company.id === DEMO_BUSINESS_ID ? null : local.company.id });
    try {
      const remote = await loadWorkspace();
      if (remote) {
        set({ ...remote, businessId: remote.company.id, syncError: null });
      }
    } catch (error) {
      markSyncFailure(error instanceof Error ? error.message : 'Supabase sync failed');
    } finally {
      set({ hydrated: true, syncing: false });
      persist(get());
    }
  },
  saveCompanySetup: async setup => {
    const currentBusinessId = get().businessId;
    set({ syncing: true, syncError: null });
    try {
      const nextBusinessId = isRemoteBusiness(currentBusinessId)
        ? await updateWorkspace(currentBusinessId, setup)
        : await createWorkspace(setup);
      const nextCompany: Company = {
        id: nextBusinessId,
        name: setup.name.trim() || 'My business',
        businessType: setup.businessType,
        currency: 'NPR',
        pan: setup.pan,
        city: setup.city,
        fiscalYear: setup.fiscalYear,
      };
      set({ company: nextCompany, businessId: nextBusinessId, syncError: null });
      if (!isRemoteBusiness(currentBusinessId)) {
        const seeded = await seedDemoWorkspace(nextBusinessId, {
          bills: get().bills,
          inventory: get().inventory,
          sales: get().sales,
          expenses: get().expenses,
          employees: get().employees,
          benefits: get().benefits,
        });
        set({ ...seeded, company: nextCompany });
      }
      persist(get());
      return true;
    } catch (error) {
      markSyncFailure(error instanceof Error ? error.message : 'Workspace could not be saved');
      return false;
    } finally {
      set({ syncing: false });
    }
  },
  setCompany: company => {
    set({ company, businessId: company.id === DEMO_BUSINESS_ID ? null : company.id });
    persist(get());
  },
  addBill: bill => {
    const localBill = { ...bill, id: id('bill') };
    set(state => ({ bills: [localBill, ...state.bills] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId)) runSync(async () => {
      const saved = await insertBill(businessId, bill);
      set(state => ({ bills: state.bills.map(item => item.id === localBill.id ? saved : item) }));
      persist(get());
    });
  },
  addSale: sale => {
    const localSale = { ...sale, id: id('sale') };
    set(state => ({ sales: [localSale, ...state.sales] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId)) runSync(async () => {
      const saved = await insertSale(businessId, sale);
      set(state => ({ sales: state.sales.map(item => item.id === localSale.id ? saved : item) }));
      persist(get());
    });
  },
  addExpense: expense => {
    const localExpense = { ...expense, id: id('expense') };
    set(state => ({ expenses: [localExpense, ...state.expenses] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId)) runSync(async () => {
      const saved = await insertExpense(businessId, expense);
      set(state => ({ expenses: state.expenses.map(item => item.id === localExpense.id ? saved : item) }));
      persist(get());
    });
  },
  saveInventory: item => {
    const localItem = { ...item, id: item.id || id('item') };
    set(state => ({ inventory: item.id ? state.inventory.map(existing => existing.id === item.id ? localItem : existing) : [localItem, ...state.inventory] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId)) runSync(async () => {
      const saved = await upsertInventory(businessId, item);
      set(state => ({ inventory: state.inventory.map(existing => existing.id === localItem.id ? saved : existing) }));
      persist(get());
    });
  },
  removeInventory: inventoryId => {
    set(state => ({ inventory: state.inventory.filter(item => item.id !== inventoryId) }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId) && inventoryId.length > 20) runSync(() => removeRemoteInventory(businessId, inventoryId));
  },
  saveEmployee: employee => {
    const localEmployee = { ...employee, id: employee.id || id('employee') };
    set(state => ({ employees: employee.id ? state.employees.map(existing => existing.id === employee.id ? localEmployee : existing) : [localEmployee, ...state.employees] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId)) runSync(async () => {
      const saved = await upsertEmployee(businessId, employee);
      set(state => ({ employees: state.employees.map(existing => existing.id === localEmployee.id ? saved : existing) }));
      persist(get());
    });
  },
  removeEmployee: employeeId => {
    set(state => ({ employees: state.employees.filter(employee => employee.id !== employeeId) }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId) && employeeId.length > 20) runSync(() => removeRemoteEmployee(businessId, employeeId));
  },
  saveBenefit: benefit => {
    const localBenefit = { ...benefit, id: benefit.id || id('benefit') };
    set(state => ({ benefits: [localBenefit, ...state.benefits.filter(existing => existing.id !== benefit.id)] }));
    persist(get());
    const businessId = get().businessId;
    if (isRemoteBusiness(businessId) && benefit.employeeId.length > 20) runSync(async () => {
      const saved = await insertBenefit(businessId, benefit);
      set(state => ({ benefits: state.benefits.map(existing => existing.id === localBenefit.id ? saved : existing) }));
      persist(get());
    });
  },
}));

export const useKhataStore = createSelectors(_useKhataStore);
export const khataStore = _useKhataStore;
