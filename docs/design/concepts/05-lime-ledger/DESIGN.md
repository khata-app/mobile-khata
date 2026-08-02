# Design 05 — Lime Ledger

Status: exploratory  
Audience: owner-operators who need a fast daily overview, mixed phone/PWA use  
Prototype: [`index.html`](index.html)  
Source: [`../../../../PLAN.md`](../../../../PLAN.md)  
Visual reference: supplied “Sortly — Recyclable or Not?” `index.html`

## 1. Intent and principles

Lime Ledger turns the daily book into a bold operational board. It borrows the reference’s cream paper, deep green, acid-lime emphasis, outlined cards, hard shadows, mono telemetry, and three-part workstation while replacing the classifier workflow with safe accounting actions and explicit offline state.

Principles:

1. Make the current business position readable in one glance.
2. Use the strongest visual treatment for one safe next action.
3. Keep confirmed figures, local drafts, and review work visibly distinct.
4. Make offline capability reassuring and concrete.
5. Keep the expressive shell compatible with touch, keyboard, reduced motion, and narrow screens.

## 2. Foundations

| Token | Value | Use |
|---|---|---|
| `leaf` | `#1F6F3A` | Brand, positive operational signal |
| `leaf-deep` | `#0F3D20` | Hero totals and high-contrast surfaces |
| `lime` | `#C6F24E` | Primary actions, selection, focus |
| `lime-soft` | `#E8FAB0` | Hover and supporting highlight |
| `cream` | `#F4EFE6` | Workspace background |
| `paper` | `#FAF7F0` | Shell, cards, fields |
| `ink` | `#0C1410` | Text, borders, hard shadows |
| `muted` | `#4A5A50` | Secondary text |
| `warning` | `#B95A16` | Pending/offline, always with text |
| `danger` | `#D4391F` | Review or destructive state, always with text |

Display and interface typography use **Bricolage Grotesque** at 400, 600, 700, and 800. **JetBrains Mono** is reserved for dates, voucher references, sync telemetry, labels, and compact amounts. Production builds should bundle reviewed font files and include a Devanagari face with tested metrics.

Spacing follows 4, 8, 12, 16, 24, and 32 px. Controls and cards use 8–18 px radii. Primary surfaces use a 2 px ink border and 2–6 px solid offset shadow. Shadows never encode state or hierarchy by themselves.

## 3. Responsive shell

- **Wide (`>1180`)**: 292 px navigation/action sidebar, flexible ledger workspace, and 336 px attention rail under a 72 px shared top bar.
- **Medium (`761–960`)**: icon rail, full workspace, and compact attention rail. Labels that are duplicated by accessible names may collapse.
- **Phone (`≤760`)**: the side rails disappear, hero cards become a horizontal snap row, entry rows reflow, and four primary destinations move to fixed bottom navigation.
- **High zoom**: content follows the phone sequence rather than preserving a squeezed three-column board.

The top bar owns tenant, fiscal year, language, and sync state. On phone, sync remains visible while less urgent context collapses.

## 4. Information architecture

Today → Sales → Purchases → Inventory → Reports → More.

The left rail combines destinations with the two highest-frequency draft actions. The center answers “what is true now?” through confirmed cash, today’s net signal, and latest entries. The right rail answers “what needs me?” through OCR review, low stock, compact counts, and recent state changes.

## 5. Component language

- **Lime action card:** one dominant, safe action per view. It uses a hard shadow and clear verb.
- **Confirmed balance card:** deep green with a textual timestamp and “balanced” label. Pending amounts never enter this number.
- **Signal card:** compares money in and out using labeled bars and exact values. Color is supplementary.
- **Entry row:** avatar, party, immutable reference/time, amount, and explicit state pill.
- **Attention card:** one problem, one explanation, one resolution action.
- **Telemetry:** mono uppercase labels for sync, fiscal period, language, dates, and identifiers.
- **Dialog:** remains local-draft oriented and states what happens when connectivity is weak.

Hover adds only one pixel of lift. Press removes most of the offset shadow to create tactile feedback. Reduced motion disables pulses and transitions.

## 6. Accounting and offline states

The UI vocabulary maps to product invariants:

- **Confirmed**: accepted by the server and included in trusted totals.
- **Waiting to sync / Waiting to confirm**: saved locally and excluded from confirmed totals.
- **Check fields**: OCR suggestions require human review and cannot post automatically.
- **Balanced**: the confirmed accounting projection reconciles; it is not a generic success decoration.
- **Offline**: core work remains available, with an explicit count of locally saved work.

The prototype’s offline control demonstrates state changes. A production implementation must derive these values from the durable outbox and trusted projections, not UI state.

## 7. Accessibility

Targets are at least 44 px, with larger primary action cards. Keyboard focus is a 4 px lime ring offset from the ink border. State is communicated through text, shape, position, and color. The visual reading order matches DOM order. At narrow widths the side content does not vanish semantically; production navigation must expose attention and quick-entry destinations through Today and More.

The lime/ink pairing is high contrast, but lime is not used for body text on paper. Devanagari rendering, 200% zoom, screen-reader labels, and amount pronunciation require dedicated implementation testing.

## 8. Performance budget

The first useful screen contains no chart library, images, blur, or required animation. Gradients are static CSS and optional. The cached shell and daily projection should paint within three seconds on the baseline 2 GB Android device. Long entry lists must virtualize in production. Font files should be subset and cached.

## 9. Critical journeys represented

The prototype includes tenant/fiscal context, BS/AD switching, confirmed cash, daily money-in/out signal, confirmed versus pending entries, OCR review, low-stock attention, responsive navigation, a local-first sale dialog, and an interactive offline/sync state.

Next wireframes: full quick sale, purchase scan and review, pending-post rejection, inventory attention, tenant switch, and the reconciled day report.

## 10. Do not do

- Do not let the bold visual treatment make every card a primary action.
- Do not include local pending amounts in confirmed hero totals.
- Do not use green/lime as the only signal for success or debit/credit.
- Do not animate hard shadows continuously.
- Do not preserve three columns on a phone or at high zoom.
- Do not describe OCR suggestions as detected facts.
- Do not imply “balanced” when the projection is stale or pending commands remain undisclosed.
- Do not turn sync telemetry into unexplained technical jargon.
