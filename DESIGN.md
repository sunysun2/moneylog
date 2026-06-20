---
name: Sentinels Slate
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  bg-base: '#09090b'
  bg-surface: '#18181b'
  border-subtle: '#27272a'
  text-muted: '#71717a'
  status-inactive: '#ef4444'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  header-height: 64px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for a high-stakes, single-user environment where data density and security are paramount. It adopts a **Corporate Modern** aesthetic fused with **Minimalist** efficiency, specifically optimized for long-session "Deep Work" in dark mode.

The target audience is a professional asset manager who requires immediate visibility into sensitive financial and account data. The UI must evoke a sense of **fortified control** and **precision**. By utilizing a "Deep Dark" palette (Zinc/Slate), we reduce eye strain while allowing state-specific colors (Amber, Crimson, Pastel Green) to command attention without overwhelming the user.

Key visual principles:
- **Security-First:** Global blur states and high-contrast indicators for protected data.
- **Data Integrity:** Subtle borders and rigid grid structures to organize dense tabular information.
- **Utility-Focused:** High-fidelity interactions like drag-and-drop grips and one-click clipboard actions are integrated seamlessly into the layout.

## Colors

The color system is built on a "Deep Dark" foundation, utilizing **Zinc-950** for the primary background and **Zinc-900** for elevated surfaces. This creates a sophisticated, low-fatigue environment.

- **Primary (Success/Active):** A vibrant Pastel Green (#10b981) used for active states and positive financial indicators.
- **Secondary (Info):** A clean Blue (#3b82f6) for primary actions and informational badges.
- **Tertiary (Warning):** Amber (#f59e0b) strictly reserved for caution states and pending items.
- **Inactive/Deleted:** A muted Crimson (#ef4444) applied at 50% opacity with a line-through decoration to denote historical but non-functional data.
- **Neutral:** A grayscale ramp from Zinc-50 (Text) down to Zinc-950 (Background), with borders standardized at Zinc-800 for subtle definition.

## Typography

The system utilizes **Inter** for its neutral, highly legible characteristics in professional SaaS environments. For data-heavy contexts—such as Account IDs, Passwords, and API Keys—**JetBrains Mono** is employed to ensure character distinction (e.g., distinguishing '1' from 'l') and provide a technical, secure feel.

- **Headlines:** Bold and tight for clear section delineation.
- **Body:** Sized at 14px for maximum information density without sacrificing readability.
- **Labels:** Uppercase with slight tracking to serve as secondary navigation/metadata markers.
- **Security Contexts:** When the Global Blur is active, typography should maintain its structural position but transition to a `blur(8px)` filter.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for the core shell and a **Fluid Content** area. 

- **Structural Shell:** A fixed 260px left sidebar for primary navigation and a 64px top header containing the global security toggle.
- **Main Content:** A centered container with a max-width of 1440px to prevent excessive line lengths on ultra-wide monitors.
- **Spacing Rhythm:** An 8px base unit (4px for tight components).
- **Responsive Behavior:** 
  - **Desktop:** Full sidebar visibility.
  - **Tablet:** Sidebar collapses to an icon-only rail (72px).
  - **Mobile:** Sidebar transitions to a bottom navigation bar; margins reduce from 24px to 16px.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Background:** Zinc-950 (Lowest elevation).
- **Cards/Panels:** Zinc-900 with a 1px border of Zinc-800.
- **Interactive States:** High-fidelity "Soft Glows." Active navigation items or focused inputs use a primary-colored outer glow (0px 0px 12px rgba(16, 185, 129, 0.15)).
- **Glassmorphism:** The Top Header and Snackbar notifications use a 12px backdrop blur with a semi-transparent Zinc-900/80 (80% opacity) fill to maintain context of the content scrolling beneath them.
- **Global Blur Toggle:** When activated, a system-wide class applies a backdrop-filter to specifically tagged "sensitive-data" containers.

## Shapes

The shape language is "Modern-Refined." We use **Rounded (0.5rem / 8px)** as the standard for small components like buttons and inputs. 

- **Large Containers:** Cards and main content panels use `rounded-xl` (1.5rem / 24px) to soften the "technical" feel of the dark mode.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **DnD Grips:** Vertical dots (⋮⋮) are used consistently to signify draggable rows within account lists.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Zinc-100 text on Primary Green background.
- **Secondary/Copy:** Ghost buttons with Zinc-800 borders; icons appear on hover.
- **Inputs:** Darker than the card background (Zinc-950), 1px Zinc-800 border. Focus state: Primary Green border and soft outer glow.
- **Accordions:** Used for conditional inputs (e.g., "Purchase Details"). Use a subtle chevron rotation and a Zinc-800 top-border separator.

### Specialized Components
- **Global Toggle (👁️/🔒):** Located in the top-right header. Uses a "Switch" pattern with clear icon representation.
- **DnD Rows:** List items must feature the handle (⋮⋮) on the far left. Upon drag, the item should scale to 1.02x and gain a primary-colored glow.
- **Snackbars:** Floating at bottom-center. Use a secondary-blue tint for currency conversion notifications (e.g., "USD to KRW updated").
- **ID/Password Fields:** Include a "Copy" icon button that appears only on hover. Content is blurred by default if the global security state is "locked."

### Status Indicators
- **Active:** Green text + Green dot.
- **Warning:** Amber text + Amber icon.
- **Inactive:** Strikethrough text, 50% opacity, muted crimson color.