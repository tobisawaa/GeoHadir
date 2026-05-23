---
name: CoreHR Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b4200'
  on-tertiary-container: '#ffa929'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-horizontal: 16px
  gutter: 12px
---

## Brand & Style

This design system is engineered for high-utility HR environments where clarity, efficiency, and trust are paramount. The aesthetic follows a **Modern Corporate Minimalism** approach—stripping away unnecessary ornamentation to prioritize data legibility and task completion. 

The target audience consists of employees managing their professional lives and HR administrators overseeing complex workflows. The UI evokes a sense of "quiet competence" through generous whitespace, a structured grid, and a purposeful use of color that guides the user toward action without causing cognitive fatigue. The visual language is disciplined, reflecting the stability and reliability required of a system handling sensitive personnel data.

## Colors

The color strategy is functional rather than decorative. **Corporate Blue** serves as the primary anchor, used for core navigation, primary actions, and brand reinforcement. 

Functional states are strictly enforced:
- **Success Green:** Reserved for positive confirmations, approved leave requests, and "checked-in" status.
- **Warning Amber:** Used for pending actions, items requiring review, or cautionary system messages.
- **Danger Red:** Utilized for rejected requests, "checked-out" status, and destructive actions.

The neutral palette utilizes a cool-toned slate to maintain a professional, crisp atmosphere, ensuring high contrast ratios that meet WCAG 2.1 AA standards for accessibility.

## Typography

The design system exclusively utilizes **Inter** for its exceptional legibility on mobile screens and its neutral, systematic character. 

The typographic hierarchy is designed to handle dense information sets. **Headline-LG** is reserved for top-level page titles (e.g., "Paystubs" or "Directory"). **Label-MD** uses an uppercase treatment with slight tracking to distinguish metadata and section headers from body content. Line heights are purposefully generous to prevent "text crowding," which is a common failure in enterprise software. For mobile views, headlines scale down to maintain a comfortable "above-the-fold" content ratio.

## Layout & Spacing

The layout operates on a **4px baseline grid** to ensure mathematical harmony across all components. On mobile devices, we employ a **Fluid Grid** with a standard **16px outer margin**. 

Spacing is used to create "grouping by proximity." Related data points (like an employee's name and department) should use `8px (sm)` spacing, while distinct sections within a card or list should use `16px (md)`. 

On larger viewports (tablets), the layout transitions to a 12-column grid, but for the mobile-first HRIS experience, content is primarily stacked vertically to ensure single-column focus, reducing the likelihood of user error during data entry.

## Elevation & Depth

To maintain a professional and "flat" aesthetic while still providing visual cues for interactivity, we use **Ambient Shadows** and **Tonal Layers**.

- **Level 0 (Background):** A very light gray (#F8FAFC) to provide contrast for white cards.
- **Level 1 (Cards/Surface):** Pure white background with a subtle 1px border (#E2E8F0) and a soft, low-opacity shadow (Y: 2px, Blur: 4px, Color: rgba(0,0,0,0.05)).
- **Level 2 (Interactive/Modals):** A more pronounced shadow to indicate focus and separation from the primary plane.

We avoid heavy gradients or neomorphism, preferring "ghost borders" for secondary elements to keep the interface looking lightweight and modern.

## Shapes

The design system adopts a **Soft (1)** roundedness level. A 4px (0.25rem) corner radius is applied to standard buttons, input fields, and small UI elements. 

This specific radius strikes the balance between the clinical "sharpness" of traditional enterprise software and the overly "playful" nature of consumer apps. Large containers, such as cards, utilize `rounded-lg (0.5rem)` to provide a distinct frame for content, while status badges use a more pronounced curve to differentiate them from functional buttons.

## Components

### Buttons
- **Primary:** Solid Corporate Blue background, white text, 4px radius. 
- **Secondary:** Transparent background, Corporate Blue 1px border and text.
- **Action Density:** Mobile buttons must maintain a minimum tap target of 44x44px.

### Cards
- **Ionic-inspired:** Full-bleed on mobile or with 16px margins. Cards should feature a 1px slate-200 border. Use a vertical stack for content: Header -> Body -> Footer (Actions).

### Status Badges
- **System:** Use a "tint-and-text" approach. For example, a "Pending" badge uses a light amber background (10% opacity) with high-contrast amber text. This ensures accessibility while maintaining the system's minimalist feel.

### Form Fields
- **Inputs:** 1px border (#CBD5E1) that shifts to Corporate Blue on focus. 
- **Validation:** Error messages appear immediately below the field in 11px Inter (Danger Red), with the border-color shifting to match.

### List Items
- **Professional List:** 16px padding, horizontal divider (#F1F5F9), and a chevron-right icon for navigable items. Subtext should always be 2 shades lighter than the primary item text.

### Navigation
- **Tab Bar:** Bottom-anchored on mobile with 4-5 core icons. Use an "Active" state that shifts the icon and label to Corporate Blue.