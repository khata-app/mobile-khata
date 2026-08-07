-- Local demo restaurant. This seed is deterministic and safe to run again.
-- Login: restaurant@restaurant.com / Password@123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'restaurant@restaurant.com',
  crypt('Password@123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Asha Shrestha"}'::jsonb,
  now(), now(), '', '', '', ''
) on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '{"sub":"10000000-0000-0000-0000-000000000001","email":"restaurant@restaurant.com","email_verified":true,"phone_verified":false}'::jsonb,
  'email', '10000000-0000-0000-0000-000000000001', now(), now(), now()
) on conflict (provider_id, provider) do nothing;

insert into public.businesses (id, name, slug, pan_number, currency_code, timezone, business_type, country_code)
values ('30000000-0000-0000-0000-000000000001', 'Aagan Kitchen & Cafe', 'aagan-kitchen-cafe', '609876543', 'NPR', 'Asia/Kathmandu', 'Restaurant & cafe', 'NP')
on conflict (id) do update set name = excluded.name, business_type = excluded.business_type, pan_number = excluded.pan_number;

insert into public.business_memberships (business_id, user_id, role)
values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'owner')
on conflict (business_id, user_id) do update set role = excluded.role;

insert into public.business_addresses (business_id, city, country_code)
values ('30000000-0000-0000-0000-000000000001', 'Lalitpur', 'NP')
on conflict (business_id) do update set city = excluded.city;

insert into public.business_settings (business_id, fiscal_year_label, vat_rate, inventory_enabled, confirmations_required)
values ('30000000-0000-0000-0000-000000000001', '2083/84', 13, true, true)
on conflict (business_id) do update set vat_rate = excluded.vat_rate, inventory_enabled = true, confirmations_required = true;

insert into public.business_bank_accounts (id, business_id, bank_name, opening_balance_paisa, is_primary)
values ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Nabil Bank', 28500000, true)
on conflict (business_id, bank_name) do update set opening_balance_paisa = excluded.opening_balance_paisa, is_primary = true;

insert into public.vendors (id, business_id, name) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Kalimati Fresh Produce'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Himalayan Food Suppliers'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Valley Beverage House')
on conflict (business_id, name) do nothing;

insert into public.customers (id, business_id, name) values
  ('41000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Walk-in customer'),
  ('41000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Patan Office Lunch'),
  ('41000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Mangal Bazaar Events')
on conflict (business_id, name) do nothing;

insert into public.inventory_items (id, business_id, supplier_id, name, category, unit, stock_quantity, daily_requirement, reorder_level, purchase_cost_paisa, selling_price_paisa) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Basmati rice', 'Grains', 'kg', 42, 8, 25, 14500, 26000),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Chicken', 'Grocery', 'kg', 18, 6, 15, 39000, 72000),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Fresh vegetables', 'Grocery', 'kg', 14, 5, 12, 11000, 26000),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'Mineral water', 'Beverages', 'bottle', 64, 10, 24, 1800, 4000),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Cooking oil', 'Grocery', 'litre', 11, 3, 12, 22000, 36000)
on conflict (id) do update set stock_quantity = excluded.stock_quantity, purchase_cost_paisa = excluded.purchase_cost_paisa, selling_price_paisa = excluded.selling_price_paisa;

insert into public.purchase_bills (id, business_id, vendor_id, invoice_number, invoice_date, total_paisa, vat_paisa, payment_method, status, created_by) values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'KFP-8821', current_date - 1, 1875000, 243750, 'Cash', 'saved', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'HFS-4418', current_date - 4, 3640000, 473200, 'Bank transfer', 'saved', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'VBH-1904', current_date - 7, 1260000, 163800, 'Credit', 'saved', '10000000-0000-0000-0000-000000000001')
on conflict (id) do update set total_paisa = excluded.total_paisa, invoice_date = excluded.invoice_date;

insert into public.sales (id, business_id, customer_id, sale_date, total_paisa, cost_paisa, payment_method, item_count, created_by) values
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', current_date, 4865000, 2140000, 'Cash', 38, '10000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000002', current_date - 1, 2850000, 1310000, 'Bank transfer', 22, '10000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000003', current_date - 3, 5200000, 2480000, 'Credit', 45, '10000000-0000-0000-0000-000000000001')
on conflict (id) do update set total_paisa = excluded.total_paisa, sale_date = excluded.sale_date;

insert into public.expenses (id, business_id, category, description, expense_date, amount_paisa, payment_method, created_by) values
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Rent', 'Restaurant rent', current_date - 5, 6500000, 'Bank transfer', '10000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Utilities', 'Gas and electricity', current_date - 2, 1480000, 'Cash', '10000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Transport', 'Morning market delivery', current_date, 320000, 'Cash', '10000000-0000-0000-0000-000000000001')
on conflict (id) do update set amount_paisa = excluded.amount_paisa, expense_date = excluded.expense_date;

insert into public.employees (id, business_id, name, department, phone, status, salary_paisa) values
  ('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Nima Tamang', 'Kitchen', '9800000001', 'active', 3200000),
  ('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Rojina Maharjan', 'Service', '9800000002', 'active', 2400000),
  ('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Suman Rai', 'Delivery', '9800000003', 'active', 2200000)
on conflict (id) do update set salary_paisa = excluded.salary_paisa, status = 'active';

insert into public.employee_benefits (id, business_id, employee_id, benefit_type, amount_paisa, benefit_date, payment_method, created_by) values
  ('91000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'Transport allowance', 250000, current_date - 3, 'Cash', '10000000-0000-0000-0000-000000000001')
on conflict (id) do update set amount_paisa = excluded.amount_paisa, benefit_date = excluded.benefit_date;

insert into public.fiscal_periods (id, business_id, name, starts_on, ends_on, status)
values ('92000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2083/84', '2026-07-17', '2027-07-16', 'open')
on conflict (business_id, name) do nothing;

insert into public.accounts (business_id, code, name, account_type, is_system) values
  ('30000000-0000-0000-0000-000000000001', '1000', 'Cash', 'asset', true),
  ('30000000-0000-0000-0000-000000000001', '1010', 'Bank', 'asset', true),
  ('30000000-0000-0000-0000-000000000001', '1100', 'Customers who owe', 'asset', true),
  ('30000000-0000-0000-0000-000000000001', '2000', 'Suppliers to pay', 'liability', true),
  ('30000000-0000-0000-0000-000000000001', '3000', 'Owner investment', 'equity', true),
  ('30000000-0000-0000-0000-000000000001', '4000', 'Sales', 'income', true),
  ('30000000-0000-0000-0000-000000000001', '5000', 'Food and item cost', 'expense', true),
  ('30000000-0000-0000-0000-000000000001', '6000', 'Running expenses', 'expense', true)
on conflict (business_id, code) do nothing;
