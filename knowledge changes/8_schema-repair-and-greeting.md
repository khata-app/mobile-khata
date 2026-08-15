# 8 Schema repair and dashboard greeting

- Added an idempotent Supabase repair migration for public.vendors.phone and public.customers.phone.
- The repair covers older or partially migrated projects where the mobile relation select could fail with "vendors_1.phone does not exist" even though the application already supports party phone numbers.
- Removed the large dashboard “Good morning” heading so the mobile home screen keeps the useful date and actions without wasting vertical space.
