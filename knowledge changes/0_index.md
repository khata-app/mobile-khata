# Knowledge changes index

This folder is the compressed memory for the refactor. Add the next numbered, descriptive note for every substantial change; split a note when it becomes too large.

| Note | Scope | Durable takeaway |
| --- | --- | --- |
| [1_supabase-foundation](1_supabase-foundation.md) | Normalized schema, RPC bootstrap, RLS | Every business record is tenant-scoped; privileged setup happens in SQL functions. |
| [2_workspace-flow](2_workspace-flow.md) | Onboarding, company wizard, cache/sync | MMKV is a cache/fallback, not the source of truth once a real business exists. |
| [3_bill-scanner](3_bill-scanner.md) | Image picker, private Storage, Gemini Edge Function | Gemini credentials stay server-side; OCR output is review-only until approval. |
| [4_ui-and-release](4_ui-and-release.md) | Notebook UI, generated asset, branches, verification | The visual stays lightweight; web export succeeds; Node 22 is required for lint. |
| [5_rustic-product-refresh](5_rustic-product-refresh.md) | Mobile-first rustic theme, camera capture, stock editor, restaurant seed, session restore | Keep one paper-ledger system across every screen; native auth must use persistent storage, not the web SSR stub. |
| [6_reliability-and-config](6_reliability-and-config.md) | Onboarding data, web auth, build metadata, storage recovery, bill-scan limits | New remote workspaces start empty; project-specific EAS metadata must come from environment variables. |
