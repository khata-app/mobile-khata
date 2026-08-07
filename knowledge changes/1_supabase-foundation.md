# 1 Supabase foundation

- Added migration `0006_normalized_workspace.sql`.
- Core tenant: existing `businesses` + `business_memberships`; normalized detail tables: `business_addresses`, `business_settings`, `business_bank_accounts`, `vendors`, `customers`, `inventory_items`, `purchase_bills`, `sales`, `expenses`, `employees`, `employee_benefits`, and `bill_documents`.
- Money is integer paisa in persisted tables; UI values remain NPR rupees and convert at the repository boundary.
- `create_workspace(payload)` is the company-wizard transaction: business + owner membership + address/settings + fiscal period + optional bank/opening balances + default accounts (including Inventory 1200).
- `update_workspace` handles later company edits.
- `can_manage_business` (owner/accountant) and `can_write_business` (owner/accountant/staff) are security-definer membership checks with `search_path = public`.
- New tables have RLS read policies by membership and write policies by role. The app never uses a service-role key.
- Cross-table trigger guards reject vendor/customer/employee/bill references that belong to another business, complementing RLS.
- Private `bill-documents` Storage bucket uses `<business_id>/<file>` paths and membership-aware object policies.
- `supabase/seed.sql` is intentionally empty: demo rows are seeded after an authenticated workspace is created, so reset cannot create anonymous tenant data.

Operational commands: `supabase link --project-ref <ref>`, `supabase db push`, `supabase secrets set GEMINI_API_KEY=...`, `supabase functions deploy scan-bill`.
