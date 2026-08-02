# Design 02 — Sajilo Signal

Status: exploratory  
Audience: phone-heavy shops, frequent sales/purchase entry, operators working amid interruptions  
Prototype: [`index.html`](index.html)  
Source: [`../../../../PLAN.md`](../../../../PLAN.md)

## 1. Intent and principles

Sajilo Signal treats accounting as a sequence of small, clear tasks. It is bright, fast, and tactile: big entry targets, strong status bands, and a “daybook” that answers what needs attention now.

Principles:

1. Optimize the repeated action without automating the irreversible action.
2. Use spatial grouping and short verbs so a glance is enough.
3. Keep the day's operational signal above historical analysis.
4. Make local/offline behavior a visible product feature.
5. Prefer bold flat color and crisp borders over expensive effects.

## 2. Foundations

| Token | Value | Use |
|---|---|---|
| `brand` | `#4E46E5` | Navigation, primary actions, focus |
| `brand-soft` | `#EAE9FF` | Selected cards and supporting fills |
| `signal` | `#C9F455` | Attention accents, never body text |
| `ink` | `#17182B` | Primary text |
| `canvas` | `#F5F6FA` | App background |
| `surface` | `#FFFFFF` | Cards and fields |
| `line` | `#DDE0EA` | Strong component boundaries |
| `success` | `#087A55` | Confirmed/online with label |
| `warning` | `#A84D00` | Pending/needs review with label |
| `danger` | `#B4233C` | Rejected/destructive with label |

Typography uses `Manrope` for Latin numerals/headings and `Noto Sans Devanagari` for Nepali, with platform fallbacks. Body is 15/22, labels 12/16, headings 26/31, and totals 34/38. Numerals are tabular. Bundle only reviewed 500, 600, and 750/700 equivalents.

Spacing uses 4, 8, 12, 16, 24, and 32. Radii are 10 for controls, 14 for cards, and 20 for major action tiles. Surfaces use 1–2 px borders with almost no shadow. Motion is 120–180 ms; status changes may use one brief scale pulse unless reduced-motion is enabled.

Breakpoints: compact `<680`, medium `680–1023`, wide `≥1024`.

## 3. Responsive shell

- **Phone:** branded top strip, compact tenant switcher, horizontal state chip, four-item bottom navigation, and a large contextual action dock.
- **Tablet:** 96 px navigation rail plus a daybook/content split.
- **Desktop/PWA:** 220 px sidebar, command/search bar, two-column operational board, optional keyboard shortcuts.
- **Narrow web:** maintains the same touch-first phone model.

The shell reserves one predictable location for offline, pending, rejected, and upgrade-required states.

## 4. Navigation map

Today → Sales → Purchases → Stock → More. Reports, expenses, contacts, vouchers, team, settings, exports, and sync health live under More on phone and expand into the desktop sidebar. Enabled feature packs determine navigation; disabled feature routes explain access and preserve export.

## 5. Components and states

- The Today page begins with two large verbs: Record sale and Add purchase. Only the contextually recommended one uses primary styling.
- “Signal cards” combine number, state word, and one-line explanation.
- Forms are step-light, not wizard-heavy: an editable summary stays visible while rows are added.
- Tables collapse to labeled transaction rows on phone; filters are horizontally scrollable chips.
- Empty screens use a sample transaction and a “Try with example” option that never posts.
- Loading uses stable placeholders. Offline, queued, failed, and confirmed states use different shapes/icons plus labels.
- Conflict and rejection cards stay in the daybook until resolved or exported.

## 6. OCR review

OCR is a “check the signals” flow. A top progress strip counts required and suggested fields. On phone, tapping a field scrolls the source crop into view; on desktop the bill stays pinned beside the form. Field states are **Looks good**, **Check this**, and **Required** in plain language, mapped internally to confirmed/suggested/required. The only primary action is “Approve purchase”; network need and pending-post behavior are stated beside it.

## 7. Actions and confirmation

The fastest safe path is prefilled but visible: BS date, recent customer, last payment account, item unit/price, and tax choice. Undo is preferred for reversible local changes. Server posting, reversal, locks, user permissions, and deletion use consequence-specific confirmation. The app never uses generic “Are you sure?” copy.

## 8. Accessibility and input

Targets are at least 48 dp, with 56 dp for daily actions. Reading order follows visual order. The signal lime is decorative and never carries text or state alone. Focus indicators use a two-tone outline that remains visible on colored tiles. At 200% text, tiles become a single column and bottom navigation labels wrap or switch to the More pattern. EN/ने mode and BS/AD switch are operable by keyboard and screen reader.

## 9. Performance and motion budget

Cached Today content paints before graphs or remote assets. No dashboard chart is needed for the first useful screen. Lists virtualize beyond 40 visible items. Interaction feedback starts within 100 ms. Transitions stay under 180 ms and animate opacity/transform only. Reduced-motion changes state instantly.

## 10. Critical journeys represented

The prototype represents daily totals, pending/offline signal, large entry actions, to-do queue, low stock, responsive navigation, sync retry, BS/AD, EN/ने, and a quick-sale panel.

Next wireframes: scan purchase, rapid line entry, resolve rejected posting, stock count, onboarding recommendations, and offline reopening.

## 11. Do not do

- Do not turn every tile into a competing call to action.
- Do not use lime for text, success, or warning semantics.
- Do not hide advanced accounting functions; place them predictably under More.
- Do not gamify revenue, streaks, or posting.
- Do not auto-advance past uncertain tax or OCR fields.
- Do not show an online-looking confirmation for a queued local command.
- Do not depend on swipe, hover, or color as the only way to act or understand.

