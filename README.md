# Khata

Khata is an Expo application for mobile and web bookkeeping. The application lives in `apps/`, shared TypeScript contracts live in `packages/contracts/`, and database migrations live in `supabase/migrations/`.

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

## Run

The web app always uses port `9999`:

```bash
pnpm run web
```

Run the Android native app with:

```bash
pnpm run mobile
```

`pnpm run dev` is an alias for the web app. The equivalent commands from inside `apps/` are `pnpm run web` and `pnpm run android`.

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
docs/design/          Product and design documentation
```
