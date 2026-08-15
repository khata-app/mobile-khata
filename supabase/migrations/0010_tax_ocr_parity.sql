-- Tax configuration, TDS capture, and OCR review safeguards.
alter table public.business_settings add column if not exists tds_rate numeric(5, 2) not null default 0 check (tds_rate >= 0 and tds_rate <= 100);
alter table public.expenses add column if not exists tds_rate numeric(5, 2) not null default 0 check (tds_rate >= 0 and tds_rate <= 100);
alter table public.expenses add column if not exists tds_paisa bigint not null default 0 check (tds_paisa >= 0 and tds_paisa <= amount_paisa);
alter table public.bill_documents add column if not exists document_hash text;
alter table public.bill_documents add column if not exists reviewed_at timestamptz;
alter table public.bill_documents add column if not exists reviewed_by uuid references auth.users(id);

create unique index if not exists bill_documents_business_hash_idx on public.bill_documents(business_id, document_hash) where document_hash is not null;

create table if not exists public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  code text not null,
  name text not null,
  kind text not null check (kind in ('vat', 'tds')),
  rate numeric(5, 2) not null check (rate >= 0 and rate <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, code)
);

alter table public.tax_rates enable row level security;
drop policy if exists tax_rates_member_read on public.tax_rates;
create policy tax_rates_member_read on public.tax_rates for select to authenticated using (public.is_business_member(business_id));
drop policy if exists tax_rates_member_write on public.tax_rates;
create policy tax_rates_member_write on public.tax_rates for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create or replace function public.ensure_default_tax_rates(target_business uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_business_member(target_business) then raise exception 'not a business member'; end if;
  insert into public.tax_rates (business_id, code, name, kind, rate)
  values (target_business, 'VAT13', 'Nepal VAT', 'vat', 13), (target_business, 'TDS1.5', 'TDS 1.5%', 'tds', 1.5), (target_business, 'TDS10', 'TDS 10%', 'tds', 10)
  on conflict (business_id, code) do nothing;
end; $$;

revoke all on function public.ensure_default_tax_rates(uuid) from public;
grant execute on function public.ensure_default_tax_rates(uuid) to authenticated;
