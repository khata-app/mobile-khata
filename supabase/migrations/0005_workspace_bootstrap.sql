create or replace function public.create_business(
  business_name text,
  business_slug text default null,
  pan text default null,
  currency text default 'NPR'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_business uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if length(trim(business_name)) < 2 then raise exception 'business name is required'; end if;
  insert into public.businesses(name, slug, pan_number, currency_code)
    values (trim(business_name), coalesce(nullif(trim(business_slug), ''), lower(regexp_replace(trim(business_name), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8)), pan, coalesce(nullif(currency, ''), 'NPR'))
    returning id into new_business;
  insert into public.business_memberships(business_id, user_id, role) values (new_business, auth.uid(), 'owner');
  perform public.seed_default_accounts(new_business);
  return new_business;
end;
$$;
revoke all on function public.create_business(text, text, text, text) from public;
grant execute on function public.create_business(text, text, text, text) to authenticated;
