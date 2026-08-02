# Design 03 — Ledger Desk

Status: exploratory  
Audience: accountants, administrators, multi-tenant operators, desktop/PWA-heavy teams  
Prototype: [`index.html`](index.html)  
Source: [`../../../../PLAN.md`](../../../../PLAN.md)

## 1. Intent and principles

Ledger Desk is a precise financial workspace. It favors scanability, keyboard control, stable table geometry, and explicit accounting provenance while retaining a simpler phone presentation for capture and approval.

Principles:

1. Let experts see more without making state ambiguous.
2. Keep source, journal effect, approval, and sync provenance close together.
3. Use strong alignment and restrained color as the primary hierarchy.
4. Support keyboard and command-palette workflows from the shell.
5. Preserve the same novice-safe language at the action boundary.

## 2. Foundations

| Token | Value | Use |
|---|---|---|
| `navy` | `#17263B` | Shell and high-emphasis text |
| `navy-deep` | `#0E1928` | Sidebar depth |
| `copper` | `#C8793A` | Primary action and active detail |
| `canvas` | `#EEF1F4` | Workspace background |
| `surface` | `#FFFFFF` | Panels and sheets |
| `line` | `#CBD2DA` | Grid and field borders |
| `success` | `#1E7055` | Confirmed with icon/text |
| `warning` | `#9A5A12` | Pending/review with icon/text |
| `danger` | `#A33B46` | Rejected/destructive with icon/text |

Typography uses `IBM Plex Sans` for interface text, `IBM Plex Mono` for references/amount columns where licensed and bundled, and `Noto Sans Devanagari` for Nepali. Prototype fallbacks are local system fonts. Body is 14/20, dense rows 13/18, labels 12/16, headings 24/30, and totals 30/34. Financial columns use tabular numerals and right alignment.

Spacing uses 4 and 6 px density increments with 16–24 px panel padding. Radius is 6 for fields, 8 for panels, and pill radius only for statuses. Elevation is expressed through borders and background layers; modal sheets use one shadow. Motion is 100–160 ms.

Breakpoints: compact `<760`, medium `760–1199`, wide `≥1200`. Dense mode is available only from 1024 px and does not change semantic ordering.

## 3. Responsive shell

- **Phone:** simplified top bar, four bottom destinations, card rows, sticky primary action. Dense tables are never merely shrunk.
- **Tablet:** collapsible 72/216 px sidebar, resizable detail panels, touch-comfortable rows by default.
- **Desktop/PWA:** 244 px labeled sidebar, global command/search bar, persistent period/tenant context, keyboard shortcuts, and split-pane review.
- **Narrow web:** phone layout with keyboard support retained.

The top status rail shows tenant, fiscal period, last confirmed cursor, pending commands, and network state without exposing technical internals.

## 4. Navigation map

Overview → Transactions (sales, purchases, expenses, payments, receipts, journals) → Accounts → Inventory → Reports → Contacts → Operations (sync, OCR, exports, audit) → Admin. Phone promotes only Overview, Transactions, Capture, and More.

Unavailable entitlements appear only in the feature manager. Previously enabled data remains readable/exportable. Permission failures explain the missing capability and owner/admin contact path.

## 5. Components and states

- Pages use a compact context bar, title/action row, filter rail, then content grid.
- Tables have sticky headers, explicit sort state, row actions in a labeled overflow menu, and a card representation for phone/200% text.
- Forms use a two-column label/control grid on wide screens and one column on phone. The posting summary remains pinned.
- Empty states preserve filters and provide one realistic example.
- Loading never removes column geometry. Errors identify scope and whether cached work is safe.
- Pending local effects use a hatched/outlined marker and separate subtotal, never blend into confirmed figures.
- Conflict review supports side-by-side versions, field changes, and recovery to a new draft.

## 6. OCR review

Wide layouts use three coordinated panes: source document, extracted fields, and accounting impact. Required issues are first; suggested values show source location and validation rationale. Keyboard shortcuts move between issues but never approve. The primary action reads “Approve and queue posting”; the resulting state reads “Pending server confirmation” until accepted.

## 7. Actions and confirmation

Primary actions sit at the page-title level or the bottom of a focused form, never both. Safe drafts autosave. Posting confirmations show voucher type, date, debit/credit total, stock effect, and period. Reversal and lock dialogs require reason text. The command palette can navigate and start drafts but cannot bypass confirmation or permissions.

## 8. Accessibility and input

All table semantics remain available to screen readers; the card alternative avoids two-dimensional navigation traps at high zoom. Every hover interaction has focus and touch equivalents. Focus uses a 2 px light/2 px dark ring. Color contrast meets AA, and amount changes include text/sign, not color alone. At 200% text, the shell collapses, toolbars wrap, and pinned panes become a sequence. Devanagari line-height is tested separately.

## 9. Performance and motion budget

The initial shell and cached ledger summary render under three seconds on baseline hardware. Tables window rows and columns where needed; totals come from indexed projections. Search debounces local queries without blocking input. No animated chart loads before the core table. Motion is capped at 160 ms and disabled in reduced-motion mode.

## 10. Critical journeys represented

The prototype shows tenant and period context, reconciled totals, pending command separation, a transaction table, operational queue, report shortcuts, responsive collapse, density toggle, command palette, EN/ने, BS/AD, and a new-voucher sheet.

Next wireframes: manual journal, ledger drill-down, OCR three-pane review, conflict comparison, fiscal lock, export job, and cross-tenant switch.

## 11. Do not do

- Do not let density hide status, touch targets, or primary action hierarchy.
- Do not make the command palette a permissions bypass.
- Do not place technical sync cursors or database jargon in user-facing errors.
- Do not present pending local amounts inside confirmed report totals.
- Do not require horizontal table use on a phone.
- Do not use color alone for debit/credit, positive/negative, or sync state.
- Do not add dashboards that cannot reconcile to journal lines.

