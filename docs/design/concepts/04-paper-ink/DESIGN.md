# Universal Design System

This document outlines the core design language, typography, color palettes, and component methodologies used in the application. It is structured so that you can extract and apply this "Bold Editorial & Utilitarian" design scheme to other applications.

## 1. Design Philosophy

- **Utilitarian & Minimal:** Focus on function over form. Data density is key, but visual clutter is reduced through strong typography and negative space.
- **High Contrast (Bold Editorial):** Rely on ink-like elements against paper-like backgrounds to mimic printed media.
- **Ergonomics & Accessibility:** Designed for single-handed mobile use. Touch targets are generous (44x44 points minimum).
- **State-Driven Indicators:** Predictable color mappings for states (Empty/Idle = Grey, Active/Occupied = Green, Warning/Transitionary = Amber). No drop shadows; use hard or soft borders to separate depth layers.

---

## 2. Color Palette (Warm Editorial)

### Paper (Backgrounds)

Used for base backgrounds, cards, and disabled/empty states.

- `Paper`: **#FAFAF7** (Primary app background)
- `Paper2`: **#F2F0E9** (Secondary backgrounds, elevated elements)
- `Paper3`: **#E8E5DB** (Empty or disabled states)

### Ink (Foregrounds & Text)

Used for typography, high-contrast buttons, and heavy borders.

- `Ink`: **#14110E** (Primary text, active icons)
- `Ink2`: **#2A251F** (Secondary high-contrast elements, default buttons)
- `Ink3`: **#5C544A** (Secondary text, inactive icons, subtle labels)
- `Ink4`: **#706860** (Tertiary text, labels — adjusted for WCAG AA compliance)

### Lines & Borders

- `Line`: **#1F1B16** (Hard borders, active outlines)
- `LineSoft`: **#D8D2C4** (Soft dividers, card borders)

### Accents & Semantic Indicators

- `Accent`: **#E15A2B** (Terracotta / Orange - Primary CTAs, active selections)
- `AccentDeep`: **#B23F16** (Pressed/Hover accent)
- `AccentSoft`: **#FBE3D6** (Accent backgrounds, light highlights)
- `OK`: **#2D6A3A** (Green - Occupied, Success, Completed)
- `OKSoft`: **#D8E8D6** (Success backgrounds)
- `Warn`: **#C58B16** (Amber - Vacated, Warnings, Pending)
- `WarnSoft`: **#F7E9C7** (Warning backgrounds)
- `Error`: **#B23A2A** (Red - Destructive actions, Errors)
- `ErrorSoft`: **#F4D7D2** (Error backgrounds)

---

## 3. Typography

A multi-typeface system distinguishing between display headers, standard reading, and data representation.

- **Display & Headings:** `Bricolage Grotesque`
  - *Weights:* 400, 500, 600, 700, 800
  - *Usage:* Page titles, large numbers, emphasizing key metrics.
- **Body & UI Text:** `Inter`
  - *Weights:* 400, 500, 600, 700
  - *Usage:* Standard buttons, paragraphs, labels, forms.
- **Data & Logs:** `JetBrains Mono`
  - *Weights:* 400, 500
  - *Usage:* Timestamps, IDs, technical logs, numeric grids.

### Common Font Sizing

- **Small Caps / Badges:** 11px, Uppercase, Bold
- **Body Text:** 13px - 15px
- **Button Text:** 15px
- **Subheadings:** 16px - 18px
- **Display / Data Highlights:** 24px+

---

## 4. Component Methodology

### A. Buttons

- **Primary:** Background `Accent`, Text `Paper`. Height 48px, Border Radius 8px, Font Size 15px, Font Weight 600.
- **Secondary/Default:** Background `Ink2`, Text `Paper`.
- **Outline:** Transparent background, Border 1px `Line`, Text `Ink`.
- **Icon Buttons:** Must use `hitSlop` or internal padding to ensure a minimum 44x44 touch target.

### B. Cards & Containers

- **Background:** `Paper`
- **Borders:** 1px solid `LineSoft`
- **Border Radius:** 12px or 16px
- **Internal Padding:** 16px
- *Methodology:* Cards should feel like distinct paper slips placed on the primary background. Do not use drop shadows.

### C. Badges & Pills

- **Padding:** 4px Vertical, 10px Horizontal.
- **Border Radius:** 100px (fully rounded).
- **Font:** 11px, Uppercase, 700 Weight.
- *Methodology:* Used for status indicators. Apply the Soft background variants with solid text color (e.g., `bg: OKSoft`, `text: OK`).

### D. Grids & Interactive Maps

- **Gap:** 6px to 8px between items.
- **Item Border Radius:** 4px to 10px depending on scale.
- **Explicit Visual States:**
  - Grey (`Paper3`) for empty/available.
  - Solid Color (`OK`) for active/occupied.
  - Secondary Solid (`Warn`) for transitionary/vacated states.

---

## 5. Spacing & Layout

- **Grid System:** Based on a 4pt/8pt increment system (4, 8, 12, 16, 20, 24, 32, 48).
- **Margins/Paddings:**
  - Standard horizontal padding for screens: 16px or 20px.
  - Standard gap between stacked elements: 8px to 16px.
- **Dividers:** Use 1px height with `LineSoft` color to separate list items. Use 1.5px with `Line` for stronger section breaks.

---

## 6. Accessibility & UX Principles

- **Touch Targets:** Minimum 44x44 points. Use padding or hit targets (like React Native's `hitSlop`) on smaller visual elements.
- **Contrast Ratios:** Text must pass WCAG AA standards (4.5:1). Ensure dark grays (like `Ink4` adjusted to `#706860`) on light backgrounds maintain legibility.
- **Graceful Degradation:** Use Skeleton loaders (pulsing shapes matching final component sizes) for asynchronous data fetching instead of empty screens or continuous spinners.
- **Feedback:** Use Bottom-positioned Toasts (Success, Error, Info) that auto-dismiss after 3 seconds for non-blocking notifications.
- **Offline Reliability:** UI must clearly indicate offline status but remain fully functional. Use floating chips (e.g., "Unsaved", "Saving", "Saved") to reassure users of data persistence.
