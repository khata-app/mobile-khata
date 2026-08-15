-- Mobile admin parity: role visibility, audit events, and safe workspace export.
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_business_created_idx on public.audit_events(business_id, created_at desc);
alter table public.audit_events enable row level security;
drop policy if exists audit_events_member_read on public.audit_events;
create policy audit_events_member_read on public.audit_events for select to authenticated using (public.is_business_member(business_id));
drop policy if exists audit_events_member_insert on public.audit_events;
create policy audit_events_member_insert on public.audit_events for insert to authenticated with check (public.is_business_member(business_id) and actor_id = auth.uid());

drop policy if exists profiles_member_read on public.profiles;
create policy profiles_member_read on public.profiles for select to authenticated using (
  id = auth.uid() or exists (select 1 from public.business_memberships membership where membership.user_id = profiles.id and public.is_business_member(membership.business_id))
);

create or replace function public.export_workspace_backup(target_business uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_business_member(target_business) then raise exception 'not a business member'; end if;
  return jsonb_build_object(
    'exportedAt', now(),
    'business', (select to_jsonb(business) from public.businesses business where business.id = target_business),
    'settings', (select to_jsonb(settings) from public.business_settings settings where settings.business_id = target_business),
    'accounts', coalesce((select jsonb_agg(to_jsonb(account)) from public.accounts account where account.business_id = target_business), '[]'::jsonb),
    'vendors', coalesce((select jsonb_agg(to_jsonb(vendor)) from public.vendors vendor where vendor.business_id = target_business), '[]'::jsonb),
    'customers', coalesce((select jsonb_agg(to_jsonb(customer)) from public.customers customer where customer.business_id = target_business), '[]'::jsonb),
    'inventory', coalesce((select jsonb_agg(to_jsonb(item)) from public.inventory_items item where item.business_id = target_business), '[]'::jsonb),
    'purchases', coalesce((select jsonb_agg(to_jsonb(bill)) from public.purchase_bills bill where bill.business_id = target_business), '[]'::jsonb),
    'sales', coalesce((select jsonb_agg(to_jsonb(sale)) from public.sales sale where sale.business_id = target_business), '[]'::jsonb),
    'expenses', coalesce((select jsonb_agg(to_jsonb(expense)) from public.expenses expense where expense.business_id = target_business), '[]'::jsonb),
    'employees', coalesce((select jsonb_agg(to_jsonb(employee)) from public.employees employee where employee.business_id = target_business), '[]'::jsonb),
    'benefits', coalesce((select jsonb_agg(to_jsonb(benefit)) from public.employee_benefits benefit where benefit.business_id = target_business), '[]'::jsonb)
  );
end; $$;

revoke all on function public.export_workspace_backup(uuid) from public;
grant execute on function public.export_workspace_backup(uuid) to authenticated;
