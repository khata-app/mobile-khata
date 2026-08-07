# Agent instructions

These rules apply to contributors and coding agents working in this repository.

## Project conventions

- Use pnpm from the repository root. Keep the workspace on the pinned version in `package.json`.
- Treat `apps/` as the Expo workspace package; do not introduce an `apps/khata/` path unless the workspace is intentionally restructured.
- Run the web app with `pnpm web` (port 9999) and Android with `pnpm mobile`.
- Prefer existing shared components, hooks, contracts, and utilities over duplicating behavior.
- Keep business logic platform-neutral where possible; isolate native APIs behind small adapters.
- Use strict TypeScript types. Avoid `any`, non-null assertions, and unsafe casts unless there is a documented reason.
- Keep user-visible strings in the translation resources and preserve the existing i18n patterns.
- Follow the existing ESLint, Prettier, Expo Router, and NativeWind conventions instead of adding competing tooling.

## Before changing code

1. Inspect the relevant files and use graphify for architecture or relationship questions.
2. Check the current git diff and preserve unrelated user changes.
3. Read nearby tests and add or update tests for changed behavior.

## Verification

Run the narrowest useful checks while iterating, then run the full applicable suite before handing off:

```bash
pnpm run lint
pnpm run type-check
pnpm run test
```

For UI or native changes, also smoke-test the affected flow with `pnpm web` or `pnpm mobile`.

## Git hygiene

- Make focused commits with conventional commit messages.
- Never commit secrets, local `.env` files, generated build output, or dependency directories.
- Do not rewrite history or discard unrelated changes.

## Knowledge changes log

- Keep the `knowledge changes/` folder in the repository.
- Every substantial change gets the next numbered, descriptive Markdown file, such as `1_supabase-foundation.md` or `2_ui-flow.md`.
- Keep each numbered note compressed and practical: record decisions, schema contracts, commands, pitfalls, and anything learned that will prevent repeated investigation.
- When a numbered note becomes too large, continue in the next number rather than making one unbounded file.
- Keep `knowledge changes/0_index.md` as the running index that summarizes what changed in every numbered note.
- Update the index and the relevant numbered note in the same change.
