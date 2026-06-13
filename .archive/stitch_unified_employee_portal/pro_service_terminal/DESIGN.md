---
name: Pro-Service Terminal
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4f4449'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#817479'
  outline-variant: '#d2c2c9'
  surface-tint: '#7d516a'
  primary: '#411c33'
  on-primary: '#ffffff'
  primary-container: '#5a324a'
  on-primary-container: '#d09bb8'
  inverse-primary: '#eeb7d4'
  secondary: '#006a68'
  on-secondary: '#ffffff'
  secondary-container: '#7cf2ee'
  on-secondary-container: '#006e6c'
  tertiary: '#192e0c'
  on-tertiary: '#ffffff'
  tertiary-container: '#2e4520'
  on-tertiary-container: '#97b383'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8eb'
  primary-fixed-dim: '#eeb7d4'
  on-primary-fixed: '#310f25'
  on-primary-fixed-variant: '#633a52'
  secondary-fixed: '#7ff5f1'
  secondary-fixed-dim: '#60d9d5'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504e'
  tertiary-fixed: '#ceebb8'
  tertiary-fixed-dim: '#b3cf9e'
  on-tertiary-fixed: '#0b2002'
  on-tertiary-fixed-variant: '#364d27'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  sidebar-dark: '#2C2C2C'
  surface-card: '#FFFFFF'
  status-pink: '#FFDDE1'
  text-main: '#4C4C4C'
  border-subtle: '#E4E4E4'
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  numpad-digit:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 240px
  gutter: 16px
  margin-page: 24px
  touch-target-min: 44px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

The design system is engineered for high-efficiency enterprise environments, specifically catering to hospitality and retail management. It balances a **Professional Corporate** aesthetic with **Modern SaaS** sensibilities, drawing direct inspiration from the Odoo ecosystem.

The personality is authoritative yet accessible—prioritizing clarity of data and speed of interaction. The visual narrative utilizes a high-contrast layout where a dark, focused navigation sidebar anchors the user, while a "Paper White" canvas provides a clean workspace for complex administrative tasks and POS transactions. 

The emotional response is one of **Reliability and Precision**. By utilizing deep wine tones against neutral grays, the UI evokes a sense of established quality without appearing dated. The style is strictly functional, avoiding unnecessary decorative elements to ensure that touch-targets in the POS terminal are unmistakable.

## Colors

The palette is anchored by **Deep Maroon (#5A324A)**, used for primary actions and brand identifiers. This color provides a sophisticated, high-contrast alternative to standard blues.

- **Primary:** Deep Maroon for critical buttons ("Open Session", "Send"), active states, and top-level branding.
- **Secondary:** Teal (#00A09D) is used sparingly for success states or specific Odoo-standard accents to maintain platform familiarity.
- **Surface & Neutrals:** A range of cool grays (starting at #F8F9FA) defines the layout structure. The sidebar uses a near-black "Ink" for maximum contrast against the white workspace.
- **Contextual Colors:** Use the "Status Pink" for occupied table states in the floor plan to ensure high visibility against the neutral grid.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is the display face, used for headers, terminal titles, and key numeric data (like total amounts and numpad digits). Its friendly but modern geometric structure improves legibility in high-pressure environments.

**Inter** is the workhorse for all functional UI elements. It is used for product lists, data tables, and administrative forms. Its neutral character ensures that long lists of inventory or customer data remain readable without visual fatigue.

Letter spacing is tightened for headings to maintain a compact, professional look, while labels use slightly increased tracking for better scannability at small sizes.

## Layout & Spacing

The system follows a **Fixed-Fluid hybrid model**. 
- The **Admin Sidebar** is fixed at 240px, allowing the workspace to expand.
- The **POS Terminal** uses a strict 3-column grid (Product Panel | Cart | Payment) to ensure critical interactive areas do not shift during use.

Spacing is built on a 4px baseline, but defaults to 16px (1rem) for most gutters. In the POS terminal, vertical density is increased to show more cart items, while horizontal spacing for product cards is generous to accommodate large touch-targets (minimum 44px height).

On mobile devices, the 3-column POS layout collapses into a tabbed or stacked view, while admin tables switch to a card-based layout to maintain data integrity.

## Elevation & Depth

This design system favors **Low-Contrast Outlines** and **Tonal Layers** over heavy shadows. This "Flat Plus" approach ensures the UI feels modern and doesn't distract the user with unnecessary depth.

- **Level 0 (Base):** Light gray background (#F8F9FA).
- **Level 1 (Cards/Panels):** Pure white surfaces with a 1px subtle border (#E4E4E4). This is the primary surface for workspace content.
- **Level 2 (Modals/Popups):** Raised via a soft, wide ambient shadow (10% opacity) to provide focus over the darkened backdrop.
- **Level 3 (Active Interactions):** Primary color fills (Deep Maroon) for buttons or highlighted items, creating immediate visual "pop" without needing physical elevation.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding of corners on buttons, cards, and input fields provides a professional, "tailored" appearance that feels cleaner than sharp corners but more serious than highly rounded pill shapes.

- **Standard Elements:** 4px radius (Buttons, Inputs, Product Cards).
- **Large Containers:** 8px radius (Modals, Terminal Panels).
- **Interactive Icons:** 4px radius or circular for specific status indicators.

## Components

### Buttons
- **Primary:** Solid Deep Maroon (#5A324A) with white text. High emphasis.
- **Secondary:** White background with 1px gray border and maroon text.
- **Utility (Numpad):** Light gray backgrounds with bold centered typography.

### POS Product Cards
- Square or slightly rectangular cards.
- Background: White.
- Top half: Product image or category color-coded icon.
- Bottom half: Product name (Body-MD) and price (Bold) aligned to the left.

### Cart Line Items
- High-density rows with a 1px bottom border.
- Include a minus/plus stepper with clearly defined touch areas.
- Discount sub-lines should be indented and styled in a slightly smaller, muted maroon text.

### Input Fields
- Understated styling: white background, 1px light gray border.
- On focus: Border changes to Primary Maroon or Teal.

### Tables (Admin)
- No vertical borders; use horizontal dividers only.
- Header row: Light gray background with uppercase, small-size labels.
- Row hover state: Very light gray tint to indicate interactivity.