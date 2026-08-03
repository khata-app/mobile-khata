import { create } from 'zustand';
import { createSelectors } from '@/lib/utils';
import { storage } from '@/lib/storage';
import type { Bill, Benefit, Company, Employee, Expense, InventoryItem, Sale } from './types';

const today = new Date().toISOString().slice(0, 10);

const defaultCompany: Company = {
  id: 'demo-company',
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

type Snapshot = Pick<KhataState, 'company' | 'bills' | 'inventory' | 'sales' | 'expenses' | 'employees' | 'benefits'>;

type KhataState = {
  company: Company;
  bills: Bill[];
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  benefits: Benefit[];
  hydrated: boolean;
  hydrate: () => void;
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
  storage.set('khata.workspace.v1', JSON.stringify(snapshot));
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const _useKhataStore = create<KhataState>((set, get) => ({
  company: defaultCompany,
  bills: initialBills,
  inventory: initialInventory,
  sales: initialSales,
  expenses: initialExpenses,
  employees: initialEmployees,
  benefits: initialBenefits,
  hydrated: false,
  hydrate: () => {
    const raw = storage.getString('khata.workspace.v1');
    if (raw) {
      try {
        set({ ...JSON.parse(raw) as Snapshot, hydrated: true });
        return;
      } catch {
        storage.remove('khata.workspace.v1');
      }
    }
    set({ hydrated: true });
  },
  setCompany: company => {
    set({ company });
    persist(get());
  },
  addBill: bill => {
    set(state => ({ bills: [{ ...bill, id: id('bill') }, ...state.bills] }));
    persist(get());
  },
  addSale: sale => {
    set(state => ({ sales: [{ ...sale, id: id('sale') }, ...state.sales] }));
    persist(get());
  },
  addExpense: expense => {
    set(state => ({ expenses: [{ ...expense, id: id('expense') }, ...state.expenses] }));
    persist(get());
  },
  saveInventory: item => {
    set(state => ({ inventory: item.id ? state.inventory.map(existing => existing.id === item.id ? { ...item, id: item.id! } : existing) : [{ ...item, id: id('item') }, ...state.inventory] }));
    persist(get());
  },
  removeInventory: itemId => {
    set(state => ({ inventory: state.inventory.filter(item => item.id !== itemId) }));
    persist(get());
  },
  saveEmployee: employee => {
    set(state => ({ employees: employee.id ? state.employees.map(existing => existing.id === employee.id ? { ...employee, id: employee.id! } : existing) : [{ ...employee, id: id('employee') }, ...state.employees] }));
    persist(get());
  },
  removeEmployee: employeeId => {
    set(state => ({ employees: state.employees.filter(employee => employee.id !== employeeId) }));
    persist(get());
  },
  saveBenefit: benefit => {
    set(state => ({ benefits: [{ ...benefit, id: benefit.id || id('benefit') }, ...state.benefits.filter(existing => existing.id !== benefit.id)] }));
    persist(get());
  },
}));

export const useKhataStore = createSelectors(_useKhataStore);
export const khataStore = _useKhataStore;
