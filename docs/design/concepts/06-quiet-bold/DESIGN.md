# Quiet Bold Design System

Version: 1.0  
Status: reusable specification  
Reference implementation: [`index.html`](index.html)

Quiet Bold is a reusable interface system for operational products: finance tools, inventory systems, admin software, logistics products, service dashboards, and other applications where people must make frequent, accurate decisions.

The system is bold through contrast, type scale, and decisive actions. It remains quiet through generous spacing, restrained decoration, predictable layouts, and a strict visual hierarchy. It is designed for desktop and phone, supports Latin and Devanagari scripts, and can be implemented in web, native, or cross-platform applications.

This document is the source of truth. Future agents and implementers should follow its rules before introducing new visual patterns.

---

## 1. Design principles

### 1.1 One dominant idea per screen

Every screen must have one obvious purpose and, at most, one visually dominant action. Supporting information should be quieter than the task that brought the user to the screen.

### 1.2 Bold hierarchy, calm surfaces

Use large headings, deep evergreen surfaces, and lime primary actions for emphasis. Use white cards, soft borders, and low-contrast backgrounds for structure. Do not make every container bold.

### 1.3 Operational clarity over decoration

Labels, values, states, and next actions must be understood at a glance. Decorative marks may reinforce identity but must not compete with data or controls.

### 1.4 Progressive disclosure

Show summary information first. Reveal detailed controls, history, filters, and secondary actions only when they become relevant. Avoid permanent side panels that duplicate the main workspace.

### 1.5 Local character, universal usability

Devanagari can give the product a regional voice through the brand mark, short greetings, dates, section accents, or culturally relevant labels. It must be intentional, correctly typeset, and understandable in context.

### 1.6 State must never depend on color alone

All success, warning, error, draft, offline, selected, and disabled states require text, an icon, a shape, or a positional signal in addition to color.

### 1.7 Mobile is a reflow, not a shrink

Phone layouts change information order and navigation behavior. They must not preserve compressed desktop columns.

---

## 2. Visual character

Quiet Bold should feel:

- Confident, not aggressive
- Modern, not fashionable for its own sake
- Warm, not sterile
- Dense enough for work, not cluttered
- Locally expressive, not ornamental
- Trustworthy, not bureaucratic

Avoid:

- Heavy black outlines on every surface
- Offset “sticker” shadows
- Multiple competing accent colors
- Rotated UI elements
- Decorative gradients behind data
- Unlabeled icon-only actions
- More than one dominant call to action in the same region
- Three or more permanent desktop rails

---

## 3. Design tokens

Tokens must be semantic. Components should use semantic names such as `color-action-primary`, not raw color names such as `lime-400`.

### 3.1 Core colors

| Token | Value | Role |
|---|---|---|
| `color-ink` | `#17201B` | Primary text and dark icons |
| `color-text-muted` | `#69736D` | Secondary text |
| `color-canvas` | `#F6F5EF` | Warm application background |
| `color-surface` | `#FFFFFF` | Cards, menus, and fields |
| `color-surface-subtle` | `#FAFBF8` | Nested and low-emphasis regions |
| `color-border` | `#DFE3DC` | Default structural border |
| `color-brand-deep` | `#0F3F2B` | Navigation and trusted hero surfaces |
| `color-brand` | `#175B3A` | Links, selected context, positive emphasis |
| `color-action-primary` | `#C9F15A` | Primary actions and active navigation |
| `color-action-soft` | `#EFF9D4` | Selected rows and positive backgrounds |

### 3.2 Feedback colors

| Token | Value | Role |
|---|---|---|
| `color-success` | `#25734A` | Confirmed and completed states |
| `color-success-soft` | `#EAF7EE` | Success background |
| `color-warning` | `#B76B16` | Review, pending, and attention |
| `color-warning-soft` | `#FFF2DB` | Warning background |
| `color-danger` | `#B84435` | Errors and destructive actions |
| `color-danger-soft` | `#FFF0ED` | Error background |
| `color-info` | `#356D99` | Informational state |
| `color-info-soft` | `#EDF5FB` | Informational background |

Feedback colors are supplementary. Pair them with explicit labels such as “Waiting to sync,” “Needs review,” or “Could not save.”

### 3.3 Dark-mode mapping

Dark mode is optional. If implemented, preserve semantic relationships rather than mathematically inverting colors.

| Light token | Suggested dark value |
|---|---|
| `color-ink` | `#EEF4F0` |
| `color-text-muted` | `#A9B6AF` |
| `color-canvas` | `#101713` |
| `color-surface` | `#18221C` |
| `color-surface-subtle` | `#1D2922` |
| `color-border` | `#304139` |
| `color-brand-deep` | `#0A2F20` |
| `color-brand` | `#66B88A` |
| `color-action-primary` | `#C9F15A` |
| `color-action-soft` | `#2B3D24` |

Primary lime actions continue to use deep green or near-black text in both modes.

### 3.4 CSS token reference

```css
:root {
  --color-ink: #17201b;
  --color-text-muted: #69736d;
  --color-canvas: #f6f5ef;
  --color-surface: #ffffff;
  --color-surface-subtle: #fafbf8;
  --color-border: #dfe3dc;
  --color-brand-deep: #0f3f2b;
  --color-brand: #175b3a;
  --color-action-primary: #c9f15a;
  --color-action-soft: #eff9d4;
  --color-success: #25734a;
  --color-success-soft: #eaf7ee;
  --color-warning: #b76b16;
  --color-warning-soft: #fff2db;
  --color-danger: #b84435;
  --color-danger-soft: #fff0ed;
  --color-info: #356d99;
  --color-info-soft: #edf5fb;
}
```

---

## 4. Typography

### 4.1 Font families

| Role | Preferred family | Fallbacks |
|---|---|---|
| Interface and display | DM Sans | Inter, system-ui, sans-serif |
| Compact telemetry | DM Mono | ui-monospace, SFMono-Regular, monospace |
| Devanagari | Noto Sans Devanagari | system Devanagari sans-serif |

DM Sans provides the system’s friendly but precise Latin voice. DM Mono is restricted to identifiers, dates, fiscal periods, timestamps, and compact machine-like values. Noto Sans Devanagari is required wherever Devanagari appears.

For an offline application, bundle reviewed WOFF2 or native font assets. Do not depend on a hosted font service.

### 4.2 Required font weights

- DM Sans: 400, 500, 600, 700
- DM Mono: 500
- Noto Sans Devanagari: 500, 600, 700

Do not synthesize bold or italic Devanagari styles.

### 4.3 Type scale

| Token | Desktop | Phone | Weight | Line height | Use |
|---|---:|---:|---:|---:|---|
| `type-display` | 44 px | 34 px | 700 | 1.05 | Primary screen title or hero value |
| `type-title-1` | 32 px | 28 px | 700 | 1.12 | Major workflow heading |
| `type-title-2` | 24 px | 22 px | 700 | 1.2 | Section group |
| `type-title-3` | 18 px | 18 px | 700 | 1.3 | Card or panel title |
| `type-body` | 15 px | 15 px | 400 | 1.55 | Default prose and labels |
| `type-body-strong` | 15 px | 15 px | 600 | 1.45 | Row titles and important labels |
| `type-small` | 12 px | 12 px | 400 | 1.45 | Supporting information |
| `type-label` | 11 px | 11 px | 600 | 1.3 | Field and status labels |
| `type-telemetry` | 11 px | 10 px | 500 | 1.3 | Dates, references, compact metadata |

Display and title text may use `-0.03em` to `-0.045em` letter spacing in Latin. Do not apply negative letter spacing to Devanagari.

### 4.4 Mixed-script rules

- Never force uppercase styling on Devanagari.
- Use language-aware font stacks with the `lang` attribute.
- Allow at least `1.35` line height for mixed-script labels.
- Keep Devanagari accents short unless the whole interface is localized.
- Do not use Devanagari as a texture behind form fields or dense data.
- Test conjuncts, vowel marks, numerals, truncation, and baseline alignment.

Example:

```html
<span class="brand-mark" lang="ne">ख</span>
<p>Good morning <span lang="ne">· शुभ प्रभात</span></p>
```

### 4.5 Numeric content

- Use tabular numerals for aligned monetary and tabular data.
- Keep currency symbols adjacent to values.
- Use the locale’s grouping convention.
- Never reduce the font size of a value solely to force it onto one line; allow the container to adapt first.
- Preserve the distinction between negative, positive, and neutral amounts using a sign and a text label when the context is ambiguous.

---

## 5. Spacing, shape, border, and elevation

### 5.1 Spacing scale

Use a 4 px base unit.

| Token | Value |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

Default card padding is 20–24 px on desktop and 16–18 px on phone. Major page regions should be separated by at least 24 px.

### 5.2 Radius scale

| Token | Value | Use |
|---|---:|---|
| `radius-sm` | 8 px | Small chips and nested controls |
| `radius-md` | 12 px | Buttons, inputs, row icons |
| `radius-lg` | 18 px | Cards and panels |
| `radius-xl` | 24 px | Optional hero or modal surface |
| `radius-full` | 999 px | Status pills only |

Avoid mixing more than three radius values on one screen.

### 5.3 Borders

- Default border: 1 px solid `color-border`
- Strong divider: 1 px using a locally increased contrast token
- Focus indicator: 3 px `color-action-primary`, offset by 2 px
- Do not use 2 px black borders as the default component language.

### 5.4 Elevation

| Token | Value | Use |
|---|---|---|
| `shadow-0` | none | Nested regions and rows |
| `shadow-1` | `0 4px 14px rgba(23,32,27,.05)` | Menus and subtle floating controls |
| `shadow-2` | `0 10px 30px rgba(23,32,27,.07)` | Primary cards |
| `shadow-3` | `0 18px 50px rgba(23,32,27,.14)` | Dialogs and overlays |

Elevation communicates layering, not importance. A primary button should not need a large shadow.

---

## 6. Iconography

Use one consistent outline icon family or a project-owned SVG set.

### 6.1 Construction

- Default size: 20 × 20 px
- Compact size: 16 × 16 px
- Large feature size: 24 × 24 px
- Stroke width: 1.75–2 px
- Round line caps and joins
- No filled and outline icon mixing in the same navigation system
- Align icons optically, not only mathematically

Recommended open-source families include Lucide and Phosphor Regular. If external packages are unsuitable, store reviewed SVG symbols locally.

### 6.2 Usage

- Pair icons with text in navigation and primary actions.
- Icon-only controls require an accessible name and a familiar symbol.
- Use arrows for direction and navigation, not as generic decoration.
- Do not use emoji, Unicode arrows, or random typographic glyphs as production icons.
- Destructive icons use danger color only inside an explicitly destructive context.
- State icons must be accompanied by a label.

### 6.3 Brand mark

The preferred regional brand mark is a single Devanagari glyph, such as `ख`, inside a lime rounded square.

```css
.brand-mark {
  inline-size: 38px;
  block-size: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--color-action-primary);
  color: var(--color-brand-deep);
  font-family: "Noto Sans Devanagari", sans-serif;
  font-size: 18px;
  font-weight: 700;
}
```

The chosen glyph must relate to the product name or meaning. Do not choose a Devanagari character only for visual novelty.

---

## 7. Responsive architecture

### 7.1 Breakpoints

Breakpoints describe layout pressure, not device brands.

| Name | Width | Default behavior |
|---|---:|---|
| `compact` | below 760 px | Phone navigation and single-column flows |
| `medium` | 760–1049 px | Reduced columns and stacked context panels |
| `wide` | 1050 px and above | Stable navigation rail and contextual columns |
| `max-content` | 1300 px | Stop expanding content; preserve readable line lengths |

### 7.2 Wide application shell

- Fixed or sticky navigation rail: 220–240 px
- Sticky top bar: 64–72 px
- Main content: flexible, maximum 1300 px
- Page gutter: 32–40 px
- At most two working columns in the main content region
- Secondary column: 280–340 px

The navigation rail owns global destinations, current organization or workspace, and sync/account state. It must not contain full workflows.

### 7.3 Medium layout

- Keep the navigation rail if the main task still has sufficient space.
- Collapse contextual two-column forms into a vertical sequence.
- Move summaries beneath the main form.
- Avoid icon-only navigation unless labels remain discoverable.

### 7.4 Compact layout

- Replace the side rail with a fixed bottom navigation.
- Limit bottom navigation to three or four destinations.
- Use Home, one high-frequency workflow, a creation action, and More.
- Stack fields and panels in task order.
- Use horizontal snap only for a small set of peer summary cards.
- Keep data tables inside horizontally scrollable containers; do not make the page itself scroll sideways.
- Place toasts, menus, and sheets above bottom navigation and safe-area insets.
- Keep primary actions reachable near the bottom of the workflow.

### 7.5 Container behavior

Components must respond to their container where possible. Use container queries for cards that can appear in a dashboard grid, a side panel, or a full-width screen.

---

## 8. Application structure

### 8.1 Global shell

The default shell consists of:

1. Brand and primary navigation
2. Workspace or tenant context
3. Top bar with breadcrumb, status, notifications, and user access
4. Main page region
5. Compact bottom navigation on phone

### 8.2 Page anatomy

Every page should follow this order:

1. Eyebrow or contextual metadata, if useful
2. Clear page title
3. One-sentence explanation
4. Primary and secondary actions
5. Summary or task status
6. Main working content
7. Supporting context

Do not add a page eyebrow if it repeats the title.

### 8.3 Dashboard anatomy

A dashboard should answer:

1. What is the most important trusted state?
2. What changed recently?
3. What needs action?

Use one hero card, two to four supporting metrics, one recent activity region, and one exception region. Additional reporting belongs behind navigation.

### 8.4 Workflow anatomy

Focused workflows use:

- Main work area for input or review
- Contextual summary beside it on wide screens
- A single final action
- Draft or cancel as secondary actions
- Explicit explanation of what finalization changes

---

## 9. Core components

### 9.1 Button

Variants:

- `primary`: lime background, deep text
- `dark`: deep background, white text
- `secondary`: white background, quiet border
- `ghost`: transparent background
- `danger`: danger background or danger text with explicit confirmation

Rules:

- Minimum height: 44 px
- Horizontal padding: 16 px
- Radius: 12 px
- Verb-first label: “Create invoice,” not “Invoice”
- One primary button per action group
- Loading buttons preserve their width and communicate progress
- Disabled buttons require an adjacent explanation when the reason is not obvious

### 9.2 Icon button

- Minimum target: 44 × 44 px
- Visible icon: 20 px
- Requires an accessible name
- Use a tooltip on pointer-based interfaces for unfamiliar actions
- Do not place multiple unlabeled icon buttons together without grouping

### 9.3 Text field and select

- Label above the control
- Control height: 46–48 px
- Radius: 11–12 px
- Quiet border by default
- Placeholder is an example, never the only label
- Error or guidance text appears below
- Low-confidence or warning input uses a tinted background and explicit message
- Required fields use text or an accessible indicator, not color alone

Field states:

- Default
- Hover
- Focus
- Filled
- Disabled
- Read-only
- Warning/review
- Error
- Success, only when confirmation is useful

### 9.4 Card

Default card:

- White surface
- 1 px quiet border
- 18 px radius
- 20–24 px padding
- Optional `shadow-2`

Nested content should use a subtle surface without another elevated card. Avoid a card inside a card inside a card.

### 9.5 Hero card

Use for one trusted or central value:

- Deep evergreen background
- White primary value
- Muted light label
- Lime reserved for a positive status or small accent
- Optional low-opacity brand glyph
- No more than one hero card per viewport

### 9.6 Metric card

Contains:

- Small icon container
- Large value
- Short label
- Optional comparison or timestamp

Metrics are supporting content and should never rival the hero value.

### 9.7 Navigation item

- Height: 48 px
- Icon plus text
- Selected state: lime background and deep text
- Default state on dark rail: muted light text
- Optional count badge aligned to the far edge
- Counts should represent actionable items, not decorative engagement metrics

### 9.8 Status pill

- Height: 20–24 px
- Compact label
- Soft semantic background
- Optional 6 px state dot or 14 px icon
- Sentence case is preferred; uppercase is permitted only for very short machine-like states

Good labels: “Confirmed,” “Waiting to sync,” “Needs review,” “Failed.”

### 9.9 Activity row

Structure:

1. Directional or category icon
2. Primary entity or event
3. Reference and timestamp
4. Amount or result
5. Explicit status

Rows use dividers, not individual card shadows. On phone, the result and status wrap beneath the title rather than squeezing the row.

### 9.10 Attention item

An attention item must state:

- What happened
- Why it matters
- What action is available

Use a lightly tinted icon container and a text or arrow action. Reserve danger styling for actual errors or destructive consequences.

### 9.11 Table and editable line items

- Header uses a subtle background
- Rows use 1 px dividers
- Numeric columns align consistently
- Inline fields look like plain data until focus, when appropriate
- Destructive row action is last
- On compact screens, provide contained horizontal scrolling or convert simple tables to labeled rows
- Sticky headers are recommended for long lists

### 9.12 Dialog, sheet, and toast

Dialog:

- Use for blocking decisions or short focused tasks
- Maximum width should reflect content, usually 480–640 px
- Place primary action last
- Do not put long multi-section forms in a modal

Bottom sheet:

- Preferred compact pattern for filters, menus, and short creation flows
- Respect the safe-area inset
- Provide a visible title and close action

Toast:

- Use for non-blocking confirmation
- Keep visible long enough to read
- Never use as the only place to explain an error requiring action
- Position above compact navigation

### 9.13 Empty, loading, and error states

Every data-driven component must define:

- Initial loading
- Refreshing with existing content
- Empty state
- Partial data
- Offline cached data
- Recoverable error
- Permission denied

Skeletons should approximate real content without pulsing aggressively. Empty states must explain what belongs in the region and provide one next action when appropriate.

---

## 10. Interaction states

Every interactive component must specify:

- Rest
- Hover, when available
- Focus-visible
- Pressed
- Selected
- Loading
- Disabled
- Error, if applicable

### 10.1 Motion

| Motion | Duration | Easing |
|---|---:|---|
| Hover/focus feedback | 100–140 ms | ease-out |
| Menu, toast, tooltip | 160–220 ms | ease-out |
| Page or panel transition | 200–280 ms | cubic-bezier(.2,.8,.2,1) |

Motion should clarify state or spatial relationships. Do not continuously pulse sync indicators, cards, or primary actions.

Honor `prefers-reduced-motion` by removing nonessential transforms and smooth scrolling.

### 10.2 Optimistic behavior

Optimistic updates are allowed only when failure is recoverable and clearly represented. Durable or consequential operations must show whether they are:

- Saved locally
- Waiting to sync
- Confirmed remotely
- Rejected and requiring attention

---

## 11. Content design

### 11.1 Voice

Use direct, calm, everyday language.

Preferred:

- “Create sales bill”
- “2 fields need a quick check”
- “Saved on this device”
- “Couldn’t sync. We’ll try again.”

Avoid:

- “Execute transaction”
- “AI detected with certainty”
- “Something went wrong”
- “Success!” without saying what succeeded

### 11.2 Labels

- Buttons begin with a verb.
- Navigation uses nouns.
- Headings describe the user’s task or state.
- Helper text explains consequences or format.
- Error text explains the cause when known and provides recovery.

### 11.3 Bilingual and Devanagari content

Good uses:

- Brand glyph: `ख`
- Small greeting: `शुभ प्रभात`
- Date or weekday: `बिहीबार`
- Optional workflow cue: `नयाँ कारोबार`
- Locale-aware unit or currency notation

Do not scatter untranslated words randomly. A Devanagari phrase must serve identity, context, or comprehension. Full localization requires complete translation, locale-aware dates and numbers, and tested layout expansion.

---

## 12. Accessibility requirements

These are requirements, not enhancements.

### 12.1 Targets and input

- Minimum pointer target: 44 × 44 px
- Keyboard access for every action
- Logical tab order matching visual order
- Visible focus indicator with at least 3:1 contrast
- No hover-only information

### 12.2 Semantics

- Use native controls before custom controls.
- Every form field has a programmatic label.
- Icon-only controls have accessible names.
- Headings follow a logical hierarchy.
- Status updates use appropriate live regions.
- Dialogs manage focus and return it to the triggering control.

### 12.3 Contrast

- Body text: at least 4.5:1
- Large text and meaningful graphics: at least 3:1
- Focus and component boundaries: at least 3:1 where required
- Never place small white text on lime
- Use deep green or ink text on lime

### 12.4 Zoom and reflow

- Support 200% browser zoom without loss of content or functionality.
- Critical workflows should remain usable at 400% where WCAG reflow applies.
- Avoid fixed content heights.
- Allow text to wrap.
- Do not truncate essential identifiers without a way to reveal them.

### 12.5 Localization testing

Test:

- Latin and Devanagari screen readers
- Mixed-script pronunciation
- Text expansion
- BS and Gregorian date formats when applicable
- Localized numbers and currency
- Right-to-left layout if the product later adds an RTL language

---

## 13. Data visualization

Quiet Bold uses charts sparingly.

- Prefer exact values and short comparisons for a small number of metrics.
- Use bars for magnitude comparison.
- Use lines for change over time.
- Use tables when precise lookup matters more than shape.
- Avoid donut charts for more than three categories.
- Do not use 3D effects, gradients, or decorative chart backgrounds.
- Always provide labels, units, and a non-color distinction.
- Tooltips supplement visible context; they do not replace axis or series labels.

Charts use brand green as the primary series, informational blue as a secondary series, and semantic warning/danger colors only for states that carry those meanings.

---

## 14. Recommended implementation architecture

The system should be layered so tokens and behavior remain portable across frameworks.

```text
design-system/
├── foundations/
│   ├── colors
│   ├── typography
│   ├── spacing
│   ├── radii
│   ├── elevation
│   ├── motion
│   └── breakpoints
├── icons/
│   ├── source
│   ├── generated
│   └── index
├── primitives/
│   ├── Box
│   ├── Stack
│   ├── Inline
│   ├── Grid
│   ├── Text
│   └── VisuallyHidden
├── controls/
│   ├── Button
│   ├── IconButton
│   ├── TextField
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Switch
│   └── DateField
├── components/
│   ├── Card
│   ├── MetricCard
│   ├── StatusPill
│   ├── NavigationItem
│   ├── ActivityRow
│   ├── AttentionItem
│   ├── DataTable
│   ├── Dialog
│   ├── Sheet
│   ├── Toast
│   └── EmptyState
├── patterns/
│   ├── AppShell
│   ├── PageHeader
│   ├── Dashboard
│   ├── ReviewWorkspace
│   ├── EntryForm
│   └── MasterDetail
├── localization/
│   ├── fonts
│   ├── number-format
│   ├── date-format
│   └── script-tests
└── documentation/
    ├── examples
    ├── accessibility
    ├── content
    └── changelog
```

### 14.1 Dependency direction

```text
Foundations → Primitives → Controls → Components → Patterns → Product screens
```

Lower layers must not import higher layers. Product-specific business logic must remain outside the design-system package.

### 14.2 Component contract

Every shared component should document:

- Purpose
- When to use
- When not to use
- Variants
- Sizes
- States
- Keyboard behavior
- Accessibility semantics
- Responsive behavior
- Content constraints
- Localization behavior
- Examples
- Visual and interaction tests

### 14.3 Styling strategy

Any styling approach is acceptable if it preserves:

- Semantic tokens
- Predictable variant APIs
- No product-specific raw colors inside shared components
- Theme support
- Server-rendering compatibility where required
- Static extraction or small runtime overhead

Avoid one-off component styles that copy token values instead of consuming the system.

---

## 15. Component API guidance

Framework-neutral component properties should remain semantic.

```ts
type ButtonProps = {
  variant?: "primary" | "dark" | "secondary" | "ghost" | "danger";
  size?: "compact" | "default";
  loading?: boolean;
  disabled?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
};

type StatusPillProps = {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  label: string;
  icon?: IconName;
};

type CardProps = {
  surface?: "default" | "subtle" | "brand";
  elevation?: 0 | 1 | 2;
  padding?: "compact" | "default" | "spacious";
};
```

Do not expose arbitrary color props for ordinary product use. Escape hatches should be rare and documented.

---

## 16. Quality and testing

### 16.1 Required visual widths

Review at minimum:

- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1280 × 800
- 1440 × 900

### 16.2 Required interaction checks

- Keyboard-only navigation
- Screen-reader labels
- 200% zoom
- Long names and values
- Empty and error states
- Slow loading
- Offline state
- Reduced motion
- High contrast or forced colors where supported
- Touch use on a small phone
- Devanagari rendering

### 16.3 Automated checks

Recommended:

- Unit tests for component behavior
- Accessibility assertions
- Visual regression tests for variants and breakpoints
- Token linting to prevent raw values
- Bundle-size monitoring
- Type checks for component APIs

### 16.4 Performance budget

- No chart library for simple progress bars or two-value comparisons.
- Icons should be tree-shaken or symbol-based.
- Fonts should be subset by required scripts and weights.
- Avoid blur and large shadow effects on scrolling lists.
- Virtualize long tables and activity feeds.
- Maintain visible feedback within 100 ms of interaction.

---

## 17. Governance

### 17.1 Adding a component

Add a shared component only when:

- The pattern appears in at least two meaningful contexts, or
- It carries important accessibility or behavioral complexity that should not be repeatedly implemented.

Before adding:

1. Check whether an existing primitive or component can be composed.
2. Define the user problem.
3. Document states and responsive behavior.
4. Verify token usage.
5. Add accessibility and visual tests.

### 17.2 Changing tokens

A token change must include:

- Reason for change
- Affected components
- Light and dark theme impact
- Contrast verification
- Migration instructions if the name or meaning changes

### 17.3 Deprecation

Deprecated component APIs should remain available for a documented migration window. Provide a replacement example and avoid silent visual changes to consequential workflows.

### 17.4 Versioning

- Patch: fixes without intended visual or API change
- Minor: backward-compatible component, token, or variant addition
- Major: breaking API, token meaning, layout, or interaction change

---

## 18. Rules for future agents

When creating a new screen with Quiet Bold:

1. Identify the screen’s single primary purpose.
2. Choose one primary action.
3. Use the standard application shell.
4. Use a maximum of two working columns.
5. Apply semantic tokens; do not introduce raw colors.
6. Reuse documented controls and components.
7. Use one outline icon language.
8. Include loading, empty, error, offline, and permission states as relevant.
9. Reflow the screen for compact width; do not merely shrink it.
10. Add Devanagari only where it supports brand, locality, or comprehension.
11. Verify keyboard, focus, contrast, zoom, and touch behavior.
12. Document any new pattern before treating it as part of the system.

Before handing off, an agent must be able to answer:

- What is the dominant task?
- What is the primary action?
- Which information is trusted, pending, or incomplete?
- How does the screen reflow on phone?
- What happens offline or after failure?
- Are all states represented without relying on color?
- Are Latin and Devanagari text rendered with the correct fonts?
- Did the implementation reuse tokens and existing components?

---

## 19. Compact implementation checklist

### Foundations

- [ ] Semantic color tokens used
- [ ] DM Sans, DM Mono, and Noto Sans Devanagari configured
- [ ] 4 px spacing scale followed
- [ ] Standard radii and elevations used
- [ ] One consistent icon set used

### Structure

- [ ] One dominant screen purpose
- [ ] One primary action per action group
- [ ] No more than two main working columns
- [ ] Main content constrained to a readable maximum width
- [ ] Compact navigation and reflow defined

### Components and states

- [ ] Native control semantics preserved
- [ ] Touch targets are at least 44 px
- [ ] Focus-visible state implemented
- [ ] Loading, empty, error, offline, and disabled states considered
- [ ] Feedback labels do not rely on color

### Language and accessibility

- [ ] Plain, verb-first action labels
- [ ] Devanagari usage is intentional and tagged with language metadata
- [ ] Contrast passes
- [ ] Keyboard order follows visual order
- [ ] 200% zoom and phone layouts tested
- [ ] Reduced motion supported

### Delivery

- [ ] Component APIs and variants documented
- [ ] Visual regression coverage added
- [ ] No unnecessary raw styling values
- [ ] Fonts and icons optimized for production
- [ ] New reusable patterns added to this specification

---

## 20. Non-negotiable summary

Quiet Bold is successful when the interface feels decisive without feeling loud. Use deep green for trust, lime for action, white for work, and warm canvas for breathing room. Let typography create hierarchy. Keep surfaces quiet. Keep states explicit. Use Devanagari with care. Build every workflow for phone as well as desktop. Prefer reusable semantic components over visual one-offs.
