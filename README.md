# Khata

Khata is an Expo application for mobile and web bookkeeping. The application lives in `apps/`, shared TypeScript contracts live in `packages/contracts/`, and database migrations live in `supabase/migrations/`.

## Branches and app URLs

- Development branch: [github.com/khata-app/mobile-khata/tree/dev](https://github.com/khata-app/mobile-khata/tree/dev)
- Public web app: [https://khata-app.github.io/mobile-khata/](https://khata-app.github.io/mobile-khata/)
- Release flow: changes land on `dev`, then are reviewed and merged into `main`. GitHub Pages deploys from `main`.

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

Copy `apps/.env.example` to `apps/.env` and provide the Supabase/API values before running the app.

For the Expo app, configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/.env`. The publishable key is safe for the client only because database access is protected by RLS; never place a secret/service-role key in Expo. Apply migrations to a Supabase project with `supabase link --project-ref <ref>` followed by `supabase db push`.

The bill scanner is an authenticated Supabase Edge Function. Set the Gemini secret on the Supabase project used by the app and deploy the function:

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

Build a local Android APK after configuring Supabase:

```bash
pnpm --dir apps prebuild:preview
pnpm --dir apps android:preview
```

The generated debug APK is written under `apps/android/app/build/outputs/apk/` and is ignored by git.

[Download the latest debug APK](./app-debug.apk)

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

1. The public landing page explains Khata and routes visitors to sign-in or registration.
2. Existing accounts load their connected company directly; new accounts complete the company setup wizard once.
3. The setup step calls `create_workspace(payload)`, which creates the tenant, membership, normalized settings, fiscal period, bank/opening balances, and chart of accounts transactionally.
4. The workspace loads tenant-scoped data from Supabase and keeps a local MMKV cache for offline continuity, refreshing again when the app returns to the foreground.
5. Purchases, sales, expenses, inventory, employees, and benefits write through the repository layer. The dashboard and reports read the same normalized state.
6. Bill images are sent to `scan-bill`, stored in the private `bill-documents` bucket, and shown for human review before a purchase is saved.

Read [knowledge changes/0_index.md](<knowledge changes/0_index.md>) for the implementation notes and decisions behind this flow.
