create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  voucher_type text not null check (voucher_type in ('sales','purchase','payment','receipt','contra','journal')),
  transaction_date date not null,
  idempotency_key text not null,
  status text not null default 'posted' check (status in ('posted','reversed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (business_id, idempotency_key)
);
create table public.voucher_lines (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.vouchers(id) on delete cascade,
  account_id uuid not null,
  debit_paisa bigint not null default 0 check (debit_paisa >= 0),
  credit_paisa bigint not null default 0 check (credit_paisa >= 0),
  description text,
  check ((debit_paisa > 0) <> (credit_paisa > 0))
);
alter table public.vouchers enable row level security;
alter table public.voucher_lines enable row level security;
create policy vouchers_member_read on public.vouchers for select to authenticated using (public.is_business_member(business_id));
create policy voucher_lines_member_read on public.voucher_lines for select to authenticated using (exists (select 1 from public.vouchers v where v.id = voucher_id and public.is_business_member(v.business_id)));

create or replace function public.post_voucher(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; total_debit bigint; total_credit bigint; line jsonb;
begin
  if not public.is_business_member((payload->>'businessId')::uuid) then raise exception 'not a business member'; end if;
  select sum((x->>'debitPaisa')::bigint), sum((x->>'creditPaisa')::bigint) into total_debit, total_credit
    from jsonb_array_elements(payload->'lines') x;
  if jsonb_array_length(payload->'lines') < 2 or total_debit is null or total_debit = 0 or total_debit <> total_credit then raise exception 'voucher is not balanced'; end if;
  insert into public.vouchers(business_id, voucher_type, transaction_date, idempotency_key, created_by)
    values ((payload->>'businessId')::uuid, payload->>'voucherType', (payload->>'transactionDate')::date, payload->>'idempotencyKey', auth.uid())
    on conflict (business_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key returning id into v_id;
  if not exists (select 1 from public.voucher_lines where voucher_id = v_id) then
    for line in select * from jsonb_array_elements(payload->'lines') loop
      insert into public.voucher_lines(voucher_id, account_id, debit_paisa, credit_paisa, description)
      values (v_id, (line->>'accountId')::uuid, coalesce((line->>'debitPaisa')::bigint,0), coalesce((line->>'creditPaisa')::bigint,0), line->>'description');
    end loop;
  end if;
  return v_id;
end; $$;
revoke all on function public.post_voucher(jsonb) from public;
grant execute on function public.post_voucher(jsonb) to authenticated;
