# 4 UI and release

- Added the generated `apps/assets/backgrounds/himalayan-paper.webp` (1200×800, about 34 KB) as a low-opacity onboarding background; it stays behind the rustic notebook UI.
- Company page keeps the existing ledger/notebook visual language while exposing the full three-step setup and Supabase-backed save state.
- Dashboard badge now distinguishes demo, syncing, Supabase-synced, and offline states.
- Updated README with dev/staging branch links, hosted URL targets, Supabase/Edge setup, and end-to-end flow.
- Added `dev` locally and document the intended `staging` branch; both are pushed after verification.
- TypeScript: passes.
- Web export: passes (`apps/dist`, ignored build output).
- Jest: 42 tests pass after making the pnpm/Expo transform rule handle versioned `.pnpm` sources; `forceExit` only prevents the existing Supabase/auth listener from keeping Jest alive.
- Lint is blocked in this container by Node 20.19.4; the repo requires Node 22 and ESLint currently calls `Object.groupBy`.
- Local Supabase lint was attempted, but the CLI could not finish pulling the Docker stack in the available run; run `supabase start && supabase db lint --local` on a machine with the images cached.
