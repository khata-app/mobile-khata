export type Company = {
  id: string;
  name: string;
  businessType: string;
  currency: string;
  pan?: string;
  city?: string;
  fiscalYear: string;
  vatRate?: number;
};

export type CompanySetup = {
  name: string;
  businessType: string;
  pan: string;
  city: string;
  fiscalYear: string;
  bank: string;
  openingCash: string;
  openingInventory: string;
  vatRate: string;
  inventory: boolean;
  confirmations: boolean;
};

export type PaymentStatus = 'paid' | 'pending' | 'partially_paid';

export type BillLineItem = { description: string; quantity: number; unitPrice: number; amount: number };

export type Bill = {
  id: string;
  vendor: string;
  invoice: string;
  date: string;
  total: number;
  vat: number;
  payment: string;
  status: 'saved' | 'review';
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  vendorPhone?: string;
  lineItems?: BillLineItem[];
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  dailyRequirement: number;
  reorderLevel: number;
  purchaseCost: number;
  sellingPrice: number;
  supplier: string;
  supplierPhone?: string;
};

export type Sale = {
  id: string;
  customer: string;
  date: string;
  total: number;
  cost: number;
  payment: string;
  itemCount: number;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  customerPhone?: string;
  paymentReceivedDate?: string;
  paymentReceivedMethod?: string;
  payerPhone?: string;
};

export type Expense = {
  id: string;
  category: string;
  description: string;
  date: string;
  amount: number;
  payment: string;
  tdsRate?: number;
  tdsAmount?: number;
};

export type Employee = {
  id: string;
  name: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  salary: number;
};

export type Benefit = {
  id: string;
  employeeId: string;
  type: string;
  amount: number;
  date: string;
  payment: string;
};
