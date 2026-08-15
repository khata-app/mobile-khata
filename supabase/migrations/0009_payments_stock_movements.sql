-- Payment parity with the web app.
alter table public.vendors add column if not exists phone text;
alter table public.customers add column if not exists phone text;
alter table public.purchase_bills add column if not exists payment_status text not null default 'paid';
alter table public.purchase_bills add column if not exists paid_paisa bigint not null default 0;
alter table public.sales add column if not exists payment_status text not null default 'paid';
alter table public.sales add column if not exists paid_paisa bigint not null default 0;
alter table public.sales add column if not exists payment_received_date date;
alter table public.sales add column if not exists payment_received_method text;
alter table public.sales add column if not exists payer_phone text;

alter table public.purchase_bills drop constraint if exists purchase_bills_payment_status_check;
alter table public.purchase_bills add constraint purchase_bills_payment_status_check check (payment_status in ('paid', 'pending', 'partially_paid'));
alter table public.sales drop constraint if exists sales_payment_status_check;
alter table public.sales add constraint sales_payment_status_check check (payment_status in ('paid', 'pending', 'partially_paid'));
alter table public.purchase_bills add constraint purchase_bills_paid_paisa_check check (paid_paisa >= 0 and paid_paisa <= total_paisa);
alter table public.sales add constraint sales_paid_paisa_check check (paid_paisa >= 0 and paid_paisa <= total_paisa);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  voucher_id uuid references public.vouchers(id) on delete set null,
  movement_type text not null check (movement_type in ('inbound', 'outbound', 'adjustment')),
  quantity numeric(18, 3) not null check (quantity > 0),
  unit_cost_paisa bigint not null default 0 check (unit_cost_paisa >= 0),
  source_type text,
  source_id text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index stock_movements_business_item_idx on public.stock_movements(business_id, inventory_item_id, created_at desc);
alter table public.stock_movements enable row level security;
create policy stock_movements_member_read on public.stock_movements for select to authenticated using (public.is_business_member(business_id));

create or replace function public.apply_stock_movement(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare movement_id uuid; item public.inventory_items%rowtype; quantity_value numeric; next_stock numeric; next_cost bigint;
begin
  if not public.is_business_member((payload->>'businessId')::uuid) then raise exception 'not a business member'; end if;
  select * into item from public.inventory_items where id = (payload->>'inventoryItemId')::uuid and business_id = (payload->>'businessId')::uuid for update;
  if item.id is null then raise exception 'inventory item not found'; end if;
  quantity_value := (payload->>'quantity')::numeric;
  if quantity_value is null or quantity_value <= 0 then raise exception 'quantity must be positive'; end if;
  if payload->>'movementType' = 'outbound' and item.stock_quantity < quantity_value then raise exception 'insufficient stock'; end if;
  next_stock := case when payload->>'movementType' = 'outbound' then item.stock_quantity - quantity_value else item.stock_quantity + quantity_value end;
  next_cost := case
    when payload->>'movementType' = 'inbound' and next_stock > 0 then round(((item.stock_quantity * item.purchase_cost_paisa) + (quantity_value * coalesce((payload->>'unitCostPaisa')::bigint, 0))) / next_stock)
    else item.purchase_cost_paisa
  end;
  update public.inventory_items set stock_quantity = next_stock, purchase_cost_paisa = next_cost, updated_at = now() where id = item.id;
  insert into public.stock_movements(business_id, inventory_item_id, voucher_id, movement_type, quantity, unit_cost_paisa, source_type, source_id, created_by)
    values ((payload->>'businessId')::uuid, item.id, nullif(payload->>'voucherId', '')::uuid, payload->>'movementType', quantity_value, coalesce((payload->>'unitCostPaisa')::bigint, 0), payload->>'sourceType', payload->>'sourceId', auth.uid())
    returning id into movement_id;
  return movement_id;
end; $$;

revoke all on function public.apply_stock_movement(jsonb) from public;
grant execute on function public.apply_stock_movement(jsonb) to authenticated;
