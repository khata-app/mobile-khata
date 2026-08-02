-- Tenant-safe chart bootstrap and opening-balance staging.
-- The client may request this command, but it must never write accounts directly.

create table public.opening_balances (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  fiscal_period_id uuid not null references public.fiscal_periods(id),
  account_id uuid not null references public.accounts(id),
  debit_paisa bigint not null default 0 check (debit_paisa >= 0),
  credit_paisa bigint not null default 0 check (credit_paisa >= 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check ((debit_paisa > 0) <> (credit_paisa > 0)),
  unique (business_id, fiscal_period_id, account_id)
);

alter table public.opening_balances enable row level security;
create policy opening_balances_member_read on public.opening_balances
  for select to authenticated using (public.is_business_member(business_id));

-- Voucher lines carry no business_id, so enforce the relationship at write time.
create or replace function public.assert_voucher_line_account_business()
returns trigger language plpgsql security definer set search_path = public as $$
declare voucher_business uuid;
begin
  select business_id into voucher_business from public.vouchers where id = new.voucher_id;
  if voucher_business is null or not exists (
    select 1 from public.accounts a where a.id = new.account_id and a.business_id = voucher_business
  ) then
    raise exception 'voucher line account belongs to another business';
  end if;
  return new;
end;
$$;

create trigger voucher_lines_account_business_guard
before insert or update on public.voucher_lines
for each row execute procedure public.assert_voucher_line_account_business();

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
