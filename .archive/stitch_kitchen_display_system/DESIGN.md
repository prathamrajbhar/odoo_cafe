---
name: Nocturne Gastronomy Light
colors:
  surface: '#fbf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#f0eeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#504448'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f3f0ec'
  outline: '#827378'
  outline-variant: '#d3c2c7'
  surface-tint: '#805065'
  primary: '#441c30'
  on-primary: '#ffffff'
  primary-container: '#5d3246'
  on-primary-container: '#d49bb3'
  inverse-primary: '#f2b6ce'
  secondary: '#635d5a'
  on-secondary: '#ffffff'
  secondary-container: '#e6ded9'
  on-secondary-container: '#67625e'
  tertiary: '#292a29'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f403f'
  on-tertiary-container: '#acacaa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e6'
  primary-fixed-dim: '#f2b6ce'
  on-primary-fixed: '#330e21'
  on-primary-fixed-variant: '#65394d'
  secondary-fixed: '#e9e1dc'
  secondary-fixed-dim: '#cdc5c0'
  on-secondary-fixed: '#1e1b18'
  on-secondary-fixed-variant: '#4b4642'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1440px
---

## Brand & Style
This design system translates a premium culinary identity into a high-utility, light-mode interface. The aesthetic is **Corporate Modern with Minimalist precision**, prioritizing functional clarity for high-pressure hospitality environments. 

The visual narrative centers on "The Pristine Kitchen"—evoking the cleanliness of a stainless steel prep station and the sharp legibility of a printed menu. By utilizing off-white surfaces and high-contrast ink-like typography, the design ensures readability under harsh kitchen lighting while maintaining the sophisticated plum signature of the parent brand. The experience is professional, efficient, and calming.

## Colors
The palette is built on a foundation of **#F8F7F5 (Off-White)** to reduce eye strain compared to pure white. 

- **Primary Plum (#5D3246):** Reserved for high-priority actions, active navigation states, and brand-identifying elements.
- **Deep Ink (#2D2926):** Used for primary text and iconography to ensure maximum contrast ratios (exceeding WCAG AAA where possible).
- **Subtle Sand (#EAE8E4):** Used for hair-line borders, dividers, and inactive state backgrounds.
- **Functional Accents:** Success and error states use desaturated, deep tones to remain legible against the light background without breaking the sophisticated color story.

## Typography
**Hanken Grotesk** is utilized across all levels to provide a sharp, contemporary feel. 

- **Headlines:** Use a tighter letter-spacing and heavier weights to anchor the page.
- **Body Text:** Set with generous line-height to ensure tickets and orders are readable at arm's length.
- **Labels:** Small caps or uppercase styling is used for secondary metadata (e.g., table numbers, timestamps) to create a clear visual distinction from primary content.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. Content is housed in a centered container on large screens but transitions to a fluid system on tablets and handhelds.

- **Grid:** A 12-column grid for desktop, 8-column for tablet, and 4-column for mobile.
- **Spacing Rhythm:** Based on an 8px square-grid system. 
- **Kitchen Optimized:** Increased touch targets and wider gutters (24px) are used in "Order Management" views to prevent accidental taps during high-speed service.
- **Breakpoints:** Mobile (<600px), Tablet (600px - 1024px), Desktop (>1024px).

## Elevation & Depth
In this light-mode iteration, depth is primarily conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Levels:** The base background is `#F8F7F5`. Elevated cards use pure white `#FFFFFF` with a 1px border in `#EAE8E4`.
- **Active State Depth:** Instead of traditional shadows, "active" or "pressed" states are indicated by a subtle inner-stroke or a color shift to the Plum accent.
- **Modals:** Use a high-blur backdrop (20px) with a semi-transparent white overlay to maintain focus while keeping the environment visible.

## Shapes
The design system utilizes **Soft (0.25rem)** roundedness to balance professional rigidity with modern approachability.

- **Standard Elements:** Buttons and inputs use a 4px (0.25rem) radius.
- **Containers:** Large cards and modal containers use an 8px (0.5rem) radius to soften the larger layout blocks.
- **Selection Indicators:** Use "Pill" shapes (full radius) for status tags and chips to make them immediately distinguishable from structural buttons.

## Components
- **Buttons:** Primary buttons use the Plum background with White text. Secondary buttons use a Deep Ink border with no fill. Large touch targets (min 44px) are mandatory.
- **Cards:** Used for table selection and menu items. Cards should have a white background and a 1px `#EAE8E4` border. "Occupied" or "Selected" states use the Plum color as a header or full fill.
- **Input Fields:** Crisp 1px borders. Focused states utilize a 2px Plum border. Labels should always be visible (no floating labels that disappear).
- **Chips/Badges:** Use for status (e.g., "Ready," "Void," "VIP"). These utilize low-saturation backgrounds with high-contrast text for immediate identification.
- **Lists:** High-density lists for order tickets use dividers in `#EAE8E4` and bold weights for "Modifier" items (e.g., "No Onions").