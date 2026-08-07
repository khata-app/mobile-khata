# Khata

Khata is an Expo application for mobile and web bookkeeping. The application lives in `apps/`, shared TypeScript contracts live in `packages/contracts/`, and database migrations live in `supabase/migrations/`.

## Branches and app URLs

- Development branch: [github.com/khata-app/mobile-khata/tree/dev](https://github.com/khata-app/mobile-khata/tree/dev)
- Staging branch: [github.com/khata-app/mobile-khata/tree/staging](https://github.com/khata-app/mobile-khata/tree/staging)
- Live development app: `https://dev.khata.app` (deployment/DNS target; attach the hosted web build before sharing publicly)
- Staging app: `https://staging.khata.app` (deployment/DNS target; attach the hosted web build before sharing publicly)

The repository does not contain hosting credentials, so the two hosted URLs are documented deployment targets rather than claims that DNS is already active.

## Requirements

- Node.js 22 or newer
- pnpm 10.12.3 (Corepack is recommended)
- Android Studio and an emulator or device for Android development

## Install

Run installation once from the repository root so pnpm creates one workspace virtual store:

```bash
corepack enable
pnpm install
```

Copy `apps/khata/.env.example` to the environment file expected by your local setup and provide the Supabase/API values before running the app.

For the Expo app, configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/.env`. The publishable key is safe for the client only because database access is protected by RLS; never place a secret/service-role key in Expo. Apply migrations to a Supabase project with `supabase link --project-ref <ref>` followed by `supabase db push`.

The bill scanner is an authenticated Supabase Edge Function. Set the Gemini secret on each Supabase project and deploy the function separately for development and staging:

```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase functions deploy scan-bill
```

## Run

The web app always uses port `9999`:

```bash
pnpm web
```

Run the Android native app with:

```bash
pnpm mobile
```

`pnpm dev` is an alias for the web app. The equivalent commands from inside `apps/` are `pnpm web` and `pnpm android`.

## Quality checks

```bash
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run check-all
```

If Expo reports that TypeScript dependencies are missing, stop the server and run `pnpm install` from the repository root. Do not run `pnpm add` from a nested directory with a stale `node_modules`; that creates the virtual-store mismatch this workspace is configured to avoid.

## Repository layout

```text
apps/                 Expo Router application
packages/contracts/   Shared API/domain types
supabase/migrations/  Database migrations
supabase/functions/   Authenticated Edge Functions (bill scanner)
knowledge changes/    Compressed implementation knowledge and change index
docs/design/          Product and design documentation
```

## Product flow

1. Onboarding explains the product and routes the user to Auth.
2. The company wizard collects business, finance, and security settings.
3. The final step calls `create_workspace(payload)`, which creates the tenant, membership, normalized settings, fiscal period, bank/opening balances, and chart of accounts transactionally.
4. The workspace loads tenant-scoped data from Supabase and keeps a local MMKV cache for offline continuity.
5. Purchases, sales, expenses, inventory, employees, and benefits write through the repository layer. The dashboard and reports read the same normalized state.
6. Bill images are sent to `scan-bill`, stored in the private `bill-documents` bucket, and shown for human review before a purchase is saved.

Read [knowledge changes/0_index.md](<knowledge changes/0_index.md>) for the implementation notes and decisions behind this flow.
