# Khata design explorations

Status: exploratory comparison  
Last reviewed: 2026-07-23  
Source: [`../../PLAN.md`](../../PLAN.md), especially sections 5, 12–16, and 20

These are three product directions for the same offline-first Nepal SME accounting app. They share the same information architecture, accounting safeguards, accessibility baseline, and responsive behavior. They intentionally differ in personality, density, and primary audience.

| Direction | Best for | Character | Trade-off | Preview |
|---|---|---|---|---|
| [01 — Ledger Calm](concepts/01-ledger-calm/DESIGN.md) | Owners and first-time accounting users | Warm, reassuring, spacious | Less information visible at once | [Open HTML](concepts/01-ledger-calm/index.html) |
| [02 — Sajilo Signal](concepts/02-sajilo-signal/DESIGN.md) | Busy shops and phone-heavy daily entry | Bright, quick, tactile | More energetic and less formal | [Open HTML](concepts/02-sajilo-signal/index.html) |
| [03 — Ledger Desk](concepts/03-ledger-desk/DESIGN.md) | Accountants and multi-tenant operators | Precise, dense, keyboard-friendly | Steeper learning curve for novices | [Open HTML](concepts/03-ledger-desk/index.html) |

## Recommendation

Use **Ledger Calm** as the baseline product language, borrow **Sajilo Signal's** mobile quick-entry treatment, and offer **Ledger Desk's** compact density as an optional desktop setting after the core flows are validated. This keeps the default approachable without limiting expert users.

## Shared non-negotiables

- One primary action per view; secondary actions remain labeled.
- `Confirmed`, `Pending sync`, `Saved on this device`, `Suggested`, and `Required` are never conveyed by color alone.
- BS is the default business date, with AD one action away.
- NPR uses integer paisa in the product even when the UI formats whole rupees.
- Phone uses bottom navigation; tablet and desktop use a labeled sidebar.
- Draft save is immediate and local. Posting, approval, invites, and authoritative exports explain when internet is required.
- Minimum touch target is 48×48 dp. Keyboard, screen reader, 200% text, contrast, and reduced motion are release criteria.
- OCR suggestions never resemble confirmed facts and never auto-post.

