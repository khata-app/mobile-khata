# Design 01 — Ledger Calm

Status: exploratory  
Audience: owner-operators, first-time accounting users, mixed phone/PWA use  
Prototype: [`index.html`](index.html)  
Source: [`../../../../PLAN.md`](../../../../PLAN.md)

## 1. Intent and principles

Ledger Calm should feel like a careful local shopkeeper's notebook made dependable by software: warm, quiet, and explicit. It reduces accounting vocabulary, gives totals room to breathe, and always says what happened to the user's work.

Principles:

1. Reassure before impressing. Plain status text beats decorative dashboards.
2. Show the next useful action, not every possible action.
3. Keep confirmed cloud facts visually separate from local pending effects.
4. Use examples and recent choices to reduce typing for low-literacy and low-frequency users.
5. Respect low-end Android constraints: flat surfaces, restrained motion, no visual effects required for comprehension.

## 2. Foundations

| Token | Value | Use |
|---|---|---|
| `brand` | `#B9432F` | Primary actions and active navigation |
| `brand-strong` | `#8F2F21` | Pressed/focus-adjacent emphasis |
| `ink` | `#282521` | Primary text |
| `muted` | `#716B63` | Supporting text, never essential state alone |
| `canvas` | `#F4F0E8` | App background |
| `surface` | `#FFFDF8` | Cards, sheets, fields |
| `line` | `#DED7CC` | Dividers and input borders |
| `success` | `#26705B` | Confirmed/healthy, paired with text/icon |
| `warning` | `#A65B13` | Pending/review, paired with text/icon |
| `danger` | `#A93636` | Rejected/destructive, paired with text/icon |

Typography uses `Inter` where bundled and `Noto Sans Devanagari` for Nepali, with system sans fallbacks in the prototype. Body is 16/24, labels 13/18, page titles 28/34, and financial totals 36/40 with tabular numerals. Review font licenses and bundle only used weights: 400, 600, 700.

Spacing is an 8-point system with 4-point fine adjustments. Radii are 12 for fields, 16 for cards, and 999 for status pills. Elevation is usually a border; raised sheets use one soft shadow. Motion is 140–220 ms with opacity/translate only. Reduced-motion removes transforms.

Breakpoints: compact `<720`, medium `720–1099`, wide `≥1100`. Content max-width is 1280 px.

## 3. Responsive shell

- **Phone:** top app bar with tenant and sync status; four bottom destinations: Home, Sales, Purchases, More. The current view owns one sticky primary button.
- **Tablet:** 88 px icon-plus-label rail, two-column cards when space permits, form summary beside the entry panel.
- **Desktop/PWA:** 232 px labeled sidebar, 72 px top bar, centered content, keyboard shortcuts and command palette.
- **Narrow web:** behaves as phone navigation without relying on hover.

Tenant context is always visible. Switching tenant closes the current local database before the next one opens; the shell shows a blocking but friendly transition.

## 4. Navigation map

Home → Sales → Purchases → Expenses → Inventory → Contacts → Reports → More (accounts, team, settings, audit, sync health).

Disabled optional features disappear from daily navigation but remain discoverable as read-only/exportable from Settings. Deep links explain why a feature is unavailable instead of failing silently.

## 5. Components and states

- Pages begin with eyebrow context, a plain title, a one-line explanation, and at most one primary action.
- Forms group “Who/When,” “What,” and “Payment.” Draft state is persistent and the primary action is sticky.
- Lists use 64–76 px rows on phone and comfortable tables on desktop. Local search and filter chips precede large datasets.
- Empty states include one concrete example and one action.
- Skeletons preserve layout. Errors state whether work is safe and what the user can do next.
- Offline work uses the text “Saved on this device.” Pending server commands use “Waiting to confirm.” Rejections remain visible with “Fix draft” and “Export copy.”
- Conflicts show the current version, displaced revision, author/device where allowed, and a recover action.

## 6. OCR review

The source image and extracted form share the screen on wide layouts and stack on phone. Fields use three explicit labels:

- **Confirmed** — deterministic validation and/or user confirmation.
- **Suggested** — plausible OCR result; user review expected.
- **Required** — missing or invalid; blocks approval.

Confidence scores are not shown as misleading percentages by default. Attention is directed with label, icon, border, and helper text. “Approve purchase” is the single primary action; approval queues posting and never claims success until the server confirms.

## 7. Actions and confirmation

Draft save is automatic and undoable. Safe local creation does not use confirmation dialogs. Posting, reversal, fiscal locking, destructive tenant actions, and permission changes require an explicit consequence summary. Repeated taps are idempotent and visibly in progress.

## 8. Accessibility and input

All controls expose names, roles, values, and state. Focus rings are 3 px and not removed. Contrast target is WCAG AA; financial data and body text aim for 7:1 where practical. Layout reflows at 200% text without horizontal scrolling except data tables, which provide a card alternative. EN/ने input mode is visible beside text fields; PAN, SKU, email, and phone never transliterate unexpectedly.

## 9. Performance and motion budget

The shell and cached summary must be useful within three seconds on the baseline 2 GB Android device. Above-the-fold dashboard renders without charts. Charts defer until idle. Routine transitions use at most two animated properties and 220 ms. No blurred backdrops or infinite shimmer. FlashList/windowing is mandatory for long lists.

## 10. Critical journeys represented

The prototype shows the confirmed/pending dashboard, Nepal date, sync state, quick sale/purchase actions, low-stock attention, recent activity, responsive navigation, EN/ने switching, BS/AD switching, and a simple “Record sale” sheet.

Next wireframes: first-run onboarding, manual sale, OCR review, rejected offline posting, tenant switch, and ledger report.

## 11. Do not do

- Do not use a red/green-only accounting language.
- Do not hide sync problems behind a spinner or generic cloud icon.
- Do not squeeze desktop ERP tables onto a phone.
- Do not use gradients, glassmorphism, or Nepal motifs as decoration.
- Do not auto-post, silently correct tax, or present OCR as certainty.
- Do not show decorative actions that have no result.
- Do not truncate critical money, date, tenant, or status text.

