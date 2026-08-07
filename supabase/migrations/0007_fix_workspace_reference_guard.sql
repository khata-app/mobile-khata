-- A trigger function attached to several tables cannot safely dereference a
-- field that does not exist on every NEW record. Read the table-specific UUID
-- through JSON so each trigger invocation only resolves its own reference.
create or replace function public.assert_workspace_reference_business()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  related_business uuid;
  reference_id uuid;
begin
  case tg_table_name
    when 'inventory_items' then
      reference_id := nullif(to_jsonb(new)->>'supplier_id', '')::uuid;
      if reference_id is not null then
        select business_id into related_business from public.vendors where id = reference_id;
      end if;
    when 'purchase_bills' then
      reference_id := nullif(to_jsonb(new)->>'vendor_id', '')::uuid;
      if reference_id is not null then
        select business_id into related_business from public.vendors where id = reference_id;
      end if;
    when 'sales' then
      reference_id := nullif(to_jsonb(new)->>'customer_id', '')::uuid;
      if reference_id is not null then
        select business_id into related_business from public.customers where id = reference_id;
      end if;
    when 'employee_benefits' then
      reference_id := nullif(to_jsonb(new)->>'employee_id', '')::uuid;
      select business_id into related_business from public.employees where id = reference_id;
    when 'bill_documents' then
      reference_id := nullif(to_jsonb(new)->>'purchase_bill_id', '')::uuid;
      if reference_id is not null then
        select business_id into related_business from public.purchase_bills where id = reference_id;
      end if;
  end case;

  if related_business is not null and related_business <> new.business_id then
    raise exception 'referenced record belongs to another business';
  end if;
  return new;
end;
$$;
