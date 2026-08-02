create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  code text not null,
  name text not null,
  account_type text not null check (account_type in ('asset','liability','equity','income','expense')),
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, code)
);

create table public.fiscal_periods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'open' check (status in ('open','locked','closed')),
  created_at timestamptz not null default now(),
  check (starts_on <= ends_on),
  unique (business_id, name)
);

create index accounts_business_idx on public.accounts(business_id);
create index fiscal_periods_business_dates_idx on public.fiscal_periods(business_id, starts_on, ends_on);

alter table public.accounts enable row level security;
alter table public.fiscal_periods enable row level security;

create policy accounts_member_read on public.accounts for select to authenticated
  using (public.is_business_member(business_id));
create policy fiscal_periods_member_read on public.fiscal_periods for select to authenticated
  using (public.is_business_member(business_id));

alter table public.voucher_lines
  add constraint voucher_lines_account_fk
  foreign key (account_id) references public.accounts(id);

-- A date-range relationship cannot be expressed by PostgreSQL's foreign-key
-- syntax, so posting is guarded by a transaction trigger below.

create or replace function public.assert_voucher_period()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.fiscal_periods p
    where p.business_id = new.business_id
      and new.transaction_date between p.starts_on and p.ends_on
      and p.status = 'open'
  ) then
    raise exception 'voucher date is outside an open fiscal period';
  end if;
  return new;
end;
$$;

create trigger vouchers_open_period_guard
before insert on public.vouchers
for each row execute procedure public.assert_voucher_period();

create or replace function public.post_voucher(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; total_debit bigint; total_credit bigint; line jsonb; business uuid;
begin
  business := (payload->>'businessId')::uuid;
  if not public.is_business_member(business) then raise exception 'not a business member'; end if;
  if jsonb_array_length(payload->'lines') < 2 then raise exception 'voucher needs at least two lines'; end if;
  select sum((x->>'debitPaisa')::bigint), sum((x->>'creditPaisa')::bigint) into total_debit, total_credit
    from jsonb_array_elements(payload->'lines') x;
  if total_debit is null or total_debit = 0 or total_debit <> total_credit then raise exception 'voucher is not balanced'; end if;
  insert into public.vouchers(business_id, voucher_type, transaction_date, idempotency_key, created_by)
    values (business, payload->>'voucherType', (payload->>'transactionDate')::date, payload->>'idempotencyKey', auth.uid())
    on conflict (business_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key returning id into v_id;
  if not exists (select 1 from public.voucher_lines where voucher_id = v_id) then
    for line in select * from jsonb_array_elements(payload->'lines') loop
      insert into public.voucher_lines(voucher_id, account_id, debit_paisa, credit_paisa, description)
      values (v_id, (line->>'accountId')::uuid, coalesce((line->>'debitPaisa')::bigint,0), coalesce((line->>'creditPaisa')::bigint,0), line->>'description');
    end loop;
  end if;
  return v_id;
end; $$;
