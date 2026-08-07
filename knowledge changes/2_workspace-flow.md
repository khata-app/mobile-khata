# 2 Workspace and data flow

- `apps/src/lib/supabase-repository.ts` is the only app data boundary for Supabase reads/writes.
- `khataStore.hydrate()` loads a local MMKV snapshot first, then replaces it with the first authenticated business and its normalized rows when Supabase is configured.
- New company setup calls the RPC and persists the existing demo rows into that new tenant so the first dashboard is useful. Subsequent bills, sales, expenses, inventory, employees, and benefits write remotely and update the local row with its server id.
- Failed writes remain visible in the local state and show an offline/sync banner; the current local queue is deliberately small and should become a durable outbox before multi-device conflict resolution.
- Company inputs are mapped: business name/type/PAN/city → business/address, VAT/inventory/security toggles/fiscal label → settings, bank/opening values → bank/opening-balance records.
- UI status is explicit: Demo workspace, Syncing, Synced to Supabase, or Offline queue.

Pitfall: do not treat the local demo ids (`bill-1`, `employee-1`, etc.) as server ids. The repository replaces them after a successful insert.
