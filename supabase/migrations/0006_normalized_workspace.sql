-- Normalized workspace records for the product UI.
-- Every application record carries business_id so the tenant boundary can be
-- enforced consistently by RLS. Money is stored as integer paisa.

alter table public.businesses
  add column if not exists business_type text not null default 'Retail',
  add column if not exists country_code text not null default 'NP';

create table if not exists public.business_addresses (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  city text not null,
  country_code text not null default 'NP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  fiscal_year_label text not null default '2082/83',
  vat_rate numeric(5, 2) not null default 13.00 check (vat_rate >= 0 and vat_rate <= 100),
  inventory_enabled boolean not null default true,
  confirmations_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  bank_name text not null,
  opening_balance_paisa bigint not null default 0 check (opening_balance_paisa >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, bank_name)
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  supplier_id uuid references public.vendors(id) on delete set null,
  name text not null,
  category text not null default 'General',
  unit text not null default 'pcs',
  stock_quantity numeric(18, 3) not null default 0 check (stock_quantity >= 0),
  daily_requirement numeric(18, 3) not null default 0 check (daily_requirement >= 0),
  reorder_level numeric(18, 3) not null default 0 check (reorder_level >= 0),
  purchase_cost_paisa bigint not null default 0 check (purchase_cost_paisa >= 0),
  selling_price_paisa bigint not null default 0 check (selling_price_paisa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_bills (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  invoice_number text not null,
  invoice_date date not null,
  total_paisa bigint not null check (total_paisa >= 0),
  vat_paisa bigint not null default 0 check (vat_paisa >= 0),
  payment_method text not null check (payment_method in ('Cash', 'Credit', 'Bank transfer', 'Online payment')),
  status text not null default 'saved' check (status in ('saved', 'review')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  sale_date date not null,
  total_paisa bigint not null check (total_paisa >= 0),
  cost_paisa bigint not null default 0 check (cost_paisa >= 0),
  payment_method text not null check (payment_method in ('Cash', 'Credit', 'Bank transfer', 'Online payment')),
  item_count integer not null default 0 check (item_count >= 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null default 'General',
  description text not null,
  expense_date date not null,
  amount_paisa bigint not null check (amount_paisa >= 0),
  payment_method text not null check (payment_method in ('Cash', 'Credit', 'Bank transfer', 'Online payment')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  department text not null default 'General',
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  salary_paisa bigint not null default 0 check (salary_paisa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_benefits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  benefit_type text not null,
  amount_paisa bigint not null check (amount_paisa >= 0),
  benefit_date date not null,
  payment_method text not null check (payment_method in ('Cash', 'Credit', 'Bank transfer', 'Online payment')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bill_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  purchase_bill_id uuid references public.purchase_bills(id) on delete set null,
  storage_path text not null,
  mime_type text not null,
  extraction_status text not null default 'pending' check (extraction_status in ('pending', 'review', 'approved', 'failed')),
  extracted_fields jsonb not null default '{}'::jsonb,
  confidence numeric(5, 4) check (confidence >= 0 and confidence <= 1),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists vendors_business_idx on public.vendors(business_id);
create index if not exists customers_business_idx on public.customers(business_id);
create index if not exists inventory_items_business_idx on public.inventory_items(business_id);
create index if not exists purchase_bills_business_date_idx on public.purchase_bills(business_id, invoice_date desc);
create index if not exists sales_business_date_idx on public.sales(business_id, sale_date desc);
create index if not exists expenses_business_date_idx on public.expenses(business_id, expense_date desc);
create index if not exists employees_business_idx on public.employees(business_id);
create index if not exists employee_benefits_business_date_idx on public.employee_benefits(business_id, benefit_date desc);
create index if not exists bill_documents_business_idx on public.bill_documents(business_id, created_at desc);

-- Foreign keys prevent missing records, while these guards prevent a valid
-- record from another tenant being attached to the current workspace.
create or replace function public.assert_workspace_reference_business()
returns trigger language plpgsql security definer set search_path = public as $$
declare related_business uuid;
begin
  if tg_table_name = 'inventory_items' and new.supplier_id is not null then
    select business_id into related_business from public.vendors where id = new.supplier_id;
  elsif tg_table_name = 'purchase_bills' and new.vendor_id is not null then
    select business_id into related_business from public.vendors where id = new.vendor_id;
  elsif tg_table_name = 'sales' and new.customer_id is not null then
    select business_id into related_business from public.customers where id = new.customer_id;
  elsif tg_table_name = 'employee_benefits' then
    select business_id into related_business from public.employees where id = new.employee_id;
  elsif tg_table_name = 'bill_documents' and new.purchase_bill_id is not null then
    select business_id into related_business from public.purchase_bills where id = new.purchase_bill_id;
  end if;
  if related_business is not null and related_business <> new.business_id then
    raise exception 'referenced record belongs to another business';
  end if;
  return new;
end;
$$;

drop trigger if exists inventory_supplier_business_guard on public.inventory_items;
create trigger inventory_supplier_business_guard
before insert or update of business_id, supplier_id on public.inventory_items
for each row execute procedure public.assert_workspace_reference_business();

drop trigger if exists purchase_vendor_business_guard on public.purchase_bills;
create trigger purchase_vendor_business_guard
before insert or update of business_id, vendor_id on public.purchase_bills
for each row execute procedure public.assert_workspace_reference_business();

drop trigger if exists sale_customer_business_guard on public.sales;
create trigger sale_customer_business_guard
before insert or update of business_id, customer_id on public.sales
for each row execute procedure public.assert_workspace_reference_business();

drop trigger if exists benefit_employee_business_guard on public.employee_benefits;
create trigger benefit_employee_business_guard
before insert or update of business_id, employee_id on public.employee_benefits
for each row execute procedure public.assert_workspace_reference_business();

drop trigger if exists document_bill_business_guard on public.bill_documents;
create trigger document_bill_business_guard
before insert or update of business_id, purchase_bill_id on public.bill_documents
for each row execute procedure public.assert_workspace_reference_business();

create or replace function public.can_manage_business(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.business_memberships
    where business_id = target_business_id
      and user_id = (select auth.uid())
      and role in ('owner', 'accountant')
  );
$$;

create or replace function public.can_write_business(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.business_memberships
    where business_id = target_business_id
      and user_id = (select auth.uid())
      and role in ('owner', 'accountant', 'staff')
  );
$$;

alter table public.business_addresses enable row level security;
alter table public.business_settings enable row level security;
alter table public.business_bank_accounts enable row level security;
alter table public.vendors enable row level security;
alter table public.customers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.purchase_bills enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.employees enable row level security;
alter table public.employee_benefits enable row level security;
alter table public.bill_documents enable row level security;

drop policy if exists businesses_member_update on public.businesses;
create policy businesses_member_update on public.businesses for update to authenticated
  using (public.can_manage_business(id)) with check (public.can_manage_business(id));

create policy business_addresses_read on public.business_addresses for select to authenticated
  using (public.is_business_member(business_id));
create policy business_addresses_write on public.business_addresses for all to authenticated
  using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy business_settings_read on public.business_settings for select to authenticated
  using (public.is_business_member(business_id));
create policy business_settings_write on public.business_settings for all to authenticated
  using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy business_bank_accounts_read on public.business_bank_accounts for select to authenticated
  using (public.is_business_member(business_id));
create policy business_bank_accounts_write on public.business_bank_accounts for all to authenticated
  using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy vendors_read on public.vendors for select to authenticated
  using (public.is_business_member(business_id));
create policy vendors_write on public.vendors for all to authenticated
  using (public.can_write_business(business_id)) with check (public.can_write_business(business_id));

create policy customers_read on public.customers for select to authenticated
  using (public.is_business_member(business_id));
create policy customers_write on public.customers for all to authenticated
  using (public.can_write_business(business_id)) with check (public.can_write_business(business_id));

create policy inventory_items_read on public.inventory_items for select to authenticated
  using (public.is_business_member(business_id));
create policy inventory_items_write on public.inventory_items for all to authenticated
  using (public.can_write_business(business_id)) with check (public.can_write_business(business_id));

create policy purchase_bills_read on public.purchase_bills for select to authenticated
  using (public.is_business_member(business_id));
create policy purchase_bills_write on public.purchase_bills for all to authenticated
  using (public.can_write_business(business_id) and created_by = (select auth.uid()))
  with check (public.can_write_business(business_id) and created_by = (select auth.uid()));

create policy sales_read on public.sales for select to authenticated
  using (public.is_business_member(business_id));
create policy sales_write on public.sales for all to authenticated
  using (public.can_write_business(business_id) and created_by = (select auth.uid()))
  with check (public.can_write_business(business_id) and created_by = (select auth.uid()));

create policy expenses_read on public.expenses for select to authenticated
  using (public.is_business_member(business_id));
create policy expenses_write on public.expenses for all to authenticated
  using (public.can_write_business(business_id) and created_by = (select auth.uid()))
  with check (public.can_write_business(business_id) and created_by = (select auth.uid()));

create policy employees_read on public.employees for select to authenticated
  using (public.is_business_member(business_id));
create policy employees_write on public.employees for all to authenticated
  using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy employee_benefits_read on public.employee_benefits for select to authenticated
  using (public.is_business_member(business_id));
create policy employee_benefits_write on public.employee_benefits for all to authenticated
  using (public.can_manage_business(business_id) and created_by = (select auth.uid()))
  with check (public.can_manage_business(business_id) and created_by = (select auth.uid()));

create policy bill_documents_read on public.bill_documents for select to authenticated
  using (public.is_business_member(business_id));
create policy bill_documents_write on public.bill_documents for all to authenticated
  using (public.can_write_business(business_id) and created_by = (select auth.uid()))
  with check (public.can_write_business(business_id) and created_by = (select auth.uid()));

-- Keep the chart of accounts useful for opening inventory entered during setup.
create or replace function public.seed_default_accounts(target_business uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare inserted_count integer;
begin
  if not public.is_business_member(target_business) then raise exception 'not a business member'; end if;
  insert into public.accounts (business_id, code, name, account_type, is_system)
  values
    (target_business, '1000', 'Cash', 'asset', true),
    (target_business, '1010', 'Bank', 'asset', true),
    (target_business, '1100', 'Accounts Receivable', 'asset', true),
    (target_business, '1200', 'Inventory', 'asset', true),
    (target_business, '2000', 'Accounts Payable', 'liability', true),
    (target_business, '3000', 'Owner Equity', 'equity', true),
    (target_business, '4000', 'Sales', 'income', true),
    (target_business, '5000', 'Cost of Goods Sold', 'expense', true),
    (target_business, '6000', 'Operating Expense', 'expense', true)
  on conflict (business_id, code) do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.seed_default_accounts(uuid) from public;
grant execute on function public.seed_default_accounts(uuid) to authenticated;

create or replace function public.create_workspace(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  new_business uuid;
  period_id uuid;
  cash_account uuid;
  inventory_account uuid;
  name_value text := trim(coalesce(payload->>'name', ''));
  fiscal_label text := coalesce(nullif(trim(payload->>'fiscalYear'), ''), '2082/83');
  start_date date := make_date(extract(year from current_date)::integer, 1, 1);
  end_date date := make_date(extract(year from current_date)::integer, 12, 31);
  cash_paisa bigint := round(coalesce(nullif(payload->>'openingCash', ''), '0')::numeric * 100);
  inventory_paisa bigint := round(coalesce(nullif(payload->>'openingInventory', ''), '0')::numeric * 100);
begin
  if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
  if length(name_value) < 2 then raise exception 'business name is required'; end if;
  if cash_paisa < 0 or inventory_paisa < 0 then raise exception 'opening balances cannot be negative'; end if;

  insert into public.businesses (name, slug, pan_number, currency_code, timezone, business_type, country_code)
  values (
    name_value,
    lower(regexp_replace(name_value, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8),
    nullif(trim(payload->>'pan'), ''),
    coalesce(nullif(trim(payload->>'currency'), ''), 'NPR'),
    coalesce(nullif(trim(payload->>'timezone'), ''), 'Asia/Kathmandu'),
    coalesce(nullif(trim(payload->>'businessType'), ''), 'Retail'),
    'NP'
  ) returning id into new_business;

  insert into public.business_memberships (business_id, user_id, role)
    values (new_business, (select auth.uid()), 'owner');
  insert into public.business_addresses (business_id, city) values (new_business, coalesce(nullif(trim(payload->>'city'), ''), 'Kathmandu'));
  insert into public.business_settings (business_id, fiscal_year_label, vat_rate, inventory_enabled, confirmations_required)
    values (new_business, fiscal_label, coalesce(nullif(payload->>'vatRate', '')::numeric, 13), coalesce((payload->>'inventory')::boolean, true), coalesce((payload->>'confirmations')::boolean, true));

  insert into public.fiscal_periods (business_id, name, starts_on, ends_on, status)
    values (new_business, fiscal_label, start_date, end_date, 'open')
    on conflict (business_id, name) do update set status = 'open'
    returning id into period_id;

  if nullif(trim(payload->>'bank'), '') is not null then
    insert into public.business_bank_accounts (business_id, bank_name, opening_balance_paisa, is_primary)
      values (new_business, trim(payload->>'bank'), 0, true);
  end if;

  perform public.seed_default_accounts(new_business);
  select id into cash_account from public.accounts where business_id = new_business and code = '1000';
  select id into inventory_account from public.accounts where business_id = new_business and code = '1200';
  if cash_paisa > 0 then
    insert into public.opening_balances (business_id, fiscal_period_id, account_id, debit_paisa, credit_paisa, created_by)
      values (new_business, period_id, cash_account, cash_paisa, 0, (select auth.uid()));
  end if;
  if inventory_paisa > 0 then
    insert into public.opening_balances (business_id, fiscal_period_id, account_id, debit_paisa, credit_paisa, created_by)
      values (new_business, period_id, inventory_account, inventory_paisa, 0, (select auth.uid()));
  end if;
  return new_business;
end;
$$;

revoke all on function public.create_workspace(jsonb) from public;
grant execute on function public.create_workspace(jsonb) to authenticated;

create or replace function public.update_workspace(target_business uuid, payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_business(target_business) then raise exception 'not allowed to update workspace'; end if;
  update public.businesses
  set name = coalesce(nullif(trim(payload->>'name'), ''), name),
      business_type = coalesce(nullif(trim(payload->>'businessType'), ''), business_type),
      pan_number = nullif(trim(payload->>'pan'), ''),
      updated_at = now()
  where id = target_business;
  insert into public.business_addresses (business_id, city)
    values (target_business, coalesce(nullif(trim(payload->>'city'), ''), 'Kathmandu'))
    on conflict (business_id) do update set city = excluded.city, updated_at = now();
  insert into public.business_settings (business_id, fiscal_year_label, vat_rate, inventory_enabled, confirmations_required)
    values (target_business, coalesce(nullif(trim(payload->>'fiscalYear'), ''), '2082/83'), coalesce(nullif(payload->>'vatRate', '')::numeric, 13), coalesce((payload->>'inventory')::boolean, true), coalesce((payload->>'confirmations')::boolean, true))
    on conflict (business_id) do update set fiscal_year_label = excluded.fiscal_year_label, vat_rate = excluded.vat_rate, inventory_enabled = excluded.inventory_enabled, confirmations_required = excluded.confirmations_required, updated_at = now();
  if nullif(trim(payload->>'bank'), '') is not null then
    insert into public.business_bank_accounts (business_id, bank_name, is_primary)
      values (target_business, trim(payload->>'bank'), true)
      on conflict (business_id, bank_name) do update set is_primary = true;
  end if;
  return target_business;
end;
$$;

revoke all on function public.update_workspace(uuid, jsonb) from public;
grant execute on function public.update_workspace(uuid, jsonb) to authenticated;

-- Private bill documents use a deterministic first path segment: <business_id>/<file>.
insert into storage.buckets (id, name, public)
values ('bill-documents', 'bill-documents', false)
on conflict (id) do nothing;

drop policy if exists bill_documents_storage_read on storage.objects;
create policy bill_documents_storage_read on storage.objects for select to authenticated
  using (bucket_id = 'bill-documents' and public.is_business_member((storage.foldername(name))[1]::uuid));
drop policy if exists bill_documents_storage_write on storage.objects;
create policy bill_documents_storage_write on storage.objects for insert to authenticated
  with check (bucket_id = 'bill-documents' and public.can_write_business((storage.foldername(name))[1]::uuid));
drop policy if exists bill_documents_storage_delete on storage.objects;
create policy bill_documents_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'bill-documents' and public.can_manage_business((storage.foldername(name))[1]::uuid));
