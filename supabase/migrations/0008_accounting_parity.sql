-- Extend the mobile voucher foundation to match the web accounting engine.
-- All writes still go through security-definer RPCs; clients never insert
-- voucher rows directly.
alter table public.vouchers add column if not exists narration text;
alter table public.vouchers add column if not exists reference_type text;
alter table public.vouchers add column if not exists reference_id text;
alter table public.vouchers add column if not exists reversed_voucher_id uuid references public.vouchers(id);

alter table public.vouchers drop constraint if exists vouchers_voucher_type_check;
alter table public.vouchers add constraint vouchers_voucher_type_check
  check (voucher_type in ('sales','purchase','payment','receipt','contra','journal','credit_note','debit_note','stock_journal'));

create or replace function public.post_voucher(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; total_debit bigint; total_credit bigint; line jsonb; business uuid;
begin
  business := (payload->>'businessId')::uuid;
  if not public.is_business_member(business) then raise exception 'not a business member'; end if;
  if jsonb_array_length(payload->'lines') < 2 then raise exception 'voucher needs at least two lines'; end if;
  select sum((x->>'debitPaisa')::bigint), sum((x->>'creditPaisa')::bigint)
    into total_debit, total_credit from jsonb_array_elements(payload->'lines') x;
  if total_debit is null or total_debit = 0 or total_debit <> total_credit then raise exception 'voucher is not balanced'; end if;
  insert into public.vouchers(business_id, voucher_type, transaction_date, idempotency_key, created_by, narration, reference_type, reference_id)
    values (business, payload->>'voucherType', (payload->>'transactionDate')::date, payload->>'idempotencyKey', auth.uid(), payload->>'narration', payload->>'referenceType', payload->>'referenceId')
    on conflict (business_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key returning id into v_id;
  if not exists (select 1 from public.voucher_lines where voucher_id = v_id) then
    for line in select * from jsonb_array_elements(payload->'lines') loop
      insert into public.voucher_lines(voucher_id, account_id, debit_paisa, credit_paisa, description)
        values (v_id, (line->>'accountId')::uuid, coalesce((line->>'debitPaisa')::bigint,0), coalesce((line->>'creditPaisa')::bigint,0), line->>'description');
    end loop;
  end if;
  return v_id;
end; $$;

create or replace function public.reverse_voucher(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare source_voucher public.vouchers%rowtype; reversal_id uuid; line record; business uuid;
begin
  business := (payload->>'businessId')::uuid;
  if not public.is_business_member(business) then raise exception 'not a business member'; end if;
  select * into source_voucher from public.vouchers where id = (payload->>'voucherId')::uuid and business_id = business;
  if source_voucher.id is null then raise exception 'voucher not found'; end if;
  if source_voucher.status = 'reversed' then raise exception 'voucher is already reversed'; end if;
  insert into public.vouchers(business_id, voucher_type, transaction_date, idempotency_key, created_by, narration, reference_type, reference_id)
    values (business, source_voucher.voucher_type, (payload->>'transactionDate')::date, payload->>'idempotencyKey', auth.uid(), 'Reversal of ' || source_voucher.id::text, 'reversal', source_voucher.id::text)
    returning id into reversal_id;
  for line in select * from public.voucher_lines where voucher_id = source_voucher.id loop
    insert into public.voucher_lines(voucher_id, account_id, debit_paisa, credit_paisa, description)
      values (reversal_id, line.account_id, line.credit_paisa, line.debit_paisa, 'Reversal: ' || coalesce(line.description, ''));
  end loop;
  update public.vouchers set status = 'reversed', reversed_voucher_id = reversal_id where id = source_voucher.id;
  return reversal_id;
end; $$;

revoke all on function public.reverse_voucher(jsonb) from public;
grant execute on function public.reverse_voucher(jsonb) to authenticated;
