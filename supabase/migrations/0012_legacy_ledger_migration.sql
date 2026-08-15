-- Backfill the simple mobile records into the balanced ledger exactly once.
create or replace function public.migrate_legacy_records_to_ledger(target_business uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare
  migrated integer := 0;
  cash_account uuid; bank_account uuid; receivable_account uuid; payable_account uuid;
  inventory_account uuid; sales_account uuid; cogs_account uuid; expense_account uuid;
  sale_row record; bill_row record; expense_row record; debit_account uuid;
begin
  if not public.is_business_member(target_business) then raise exception 'not a business member'; end if;
  perform public.seed_default_accounts(target_business);
  select id into cash_account from public.accounts where business_id = target_business and code = '1000';
  select id into bank_account from public.accounts where business_id = target_business and code = '1010';
  select id into receivable_account from public.accounts where business_id = target_business and code = '1100';
  select id into inventory_account from public.accounts where business_id = target_business and code = '1200';
  select id into payable_account from public.accounts where business_id = target_business and code = '2000';
  select id into sales_account from public.accounts where business_id = target_business and code = '4000';
  select id into cogs_account from public.accounts where business_id = target_business and code = '5000';
  select id into expense_account from public.accounts where business_id = target_business and code = '6000';

  for sale_row in select * from public.sales where business_id = target_business loop
    if not exists (select 1 from public.vouchers where business_id = target_business and reference_type = 'legacy_sale' and reference_id = sale_row.id::text) then
      debit_account := case when sale_row.payment_method = 'Credit' then receivable_account when sale_row.payment_method in ('Bank transfer', 'Online payment') then bank_account else cash_account end;
      insert into public.vouchers (business_id, voucher_type, transaction_date, idempotency_key, created_by, narration, reference_type, reference_id)
        values (target_business, 'sales', sale_row.sale_date, 'legacy:sale:' || sale_row.id, auth.uid(), 'Migrated mobile sale', 'legacy_sale', sale_row.id::text);
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, debit_account, sale_row.total_paisa, 0, 'Migrated sale amount' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:sale:' || sale_row.id;
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, sales_account, 0, sale_row.total_paisa, 'Migrated sales revenue' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:sale:' || sale_row.id;
      if sale_row.cost_paisa > 0 then
        insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
          select id, cogs_account, sale_row.cost_paisa, 0, 'Migrated cost of goods sold' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:sale:' || sale_row.id;
        insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
          select id, inventory_account, 0, sale_row.cost_paisa, 'Migrated inventory cost' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:sale:' || sale_row.id;
      end if;
      migrated := migrated + 1;
    end if;
  end loop;

  for bill_row in select * from public.purchase_bills where business_id = target_business loop
    if not exists (select 1 from public.vouchers where business_id = target_business and reference_type = 'legacy_purchase' and reference_id = bill_row.id::text) then
      debit_account := case when bill_row.payment_method = 'Credit' then payable_account when bill_row.payment_method in ('Bank transfer', 'Online payment') then bank_account else cash_account end;
      insert into public.vouchers (business_id, voucher_type, transaction_date, idempotency_key, created_by, narration, reference_type, reference_id)
        values (target_business, 'purchase', bill_row.invoice_date, 'legacy:purchase:' || bill_row.id, auth.uid(), 'Migrated mobile purchase', 'legacy_purchase', bill_row.id::text);
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, inventory_account, bill_row.total_paisa, 0, 'Migrated purchase' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:purchase:' || bill_row.id;
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, debit_account, 0, bill_row.total_paisa, 'Migrated purchase payment' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:purchase:' || bill_row.id;
      migrated := migrated + 1;
    end if;
  end loop;

  for expense_row in select * from public.expenses where business_id = target_business loop
    if not exists (select 1 from public.vouchers where business_id = target_business and reference_type = 'legacy_expense' and reference_id = expense_row.id::text) then
      debit_account := case when expense_row.payment_method = 'Credit' then payable_account when expense_row.payment_method in ('Bank transfer', 'Online payment') then bank_account else cash_account end;
      insert into public.vouchers (business_id, voucher_type, transaction_date, idempotency_key, created_by, narration, reference_type, reference_id)
        values (target_business, 'payment', expense_row.expense_date, 'legacy:expense:' || expense_row.id, auth.uid(), 'Migrated mobile expense', 'legacy_expense', expense_row.id::text);
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, expense_account, expense_row.amount_paisa, 0, 'Migrated operating expense' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:expense:' || expense_row.id;
      insert into public.voucher_lines (voucher_id, account_id, debit_paisa, credit_paisa, description)
        select id, debit_account, 0, expense_row.amount_paisa, 'Migrated expense payment' from public.vouchers where business_id = target_business and idempotency_key = 'legacy:expense:' || expense_row.id;
      migrated := migrated + 1;
    end if;
  end loop;
  return migrated;
end; $$;

revoke all on function public.migrate_legacy_records_to_ledger(uuid) from public;
grant execute on function public.migrate_legacy_records_to_ledger(uuid) to authenticated;
