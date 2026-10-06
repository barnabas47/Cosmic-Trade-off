---
name: Deep Space Telemetry Lab
colors:
  surface: '#131317'
  surface-dim: '#131317'
  surface-bright: '#39393d'
  surface-container-lowest: '#0e0e12'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#2a292e'
  surface-container-highest: '#353439'
  on-surface: '#e5e1e7'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e1e7'
  inverse-on-surface: '#303034'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e0fdff'
  on-primary: '#00373a'
  primary-container: '#00f2fe'
  on-primary-container: '#006a70'
  inverse-primary: '#00696f'
  secondary: '#e0b6ff'
  on-secondary: '#4c007d'
  secondary-container: '#6d11ad'
  on-secondary-container: '#d7a4ff'
  tertiary: '#f1f8ff'
  on-tertiary: '#00354a'
  tertiary-container: '#b2e1ff'
  on-tertiary-container: '#00678c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#f2daff'
  secondary-fixed-dim: '#e0b6ff'
  on-secondary-fixed: '#2e004e'
  on-secondary-fixed-variant: '#6a0baa'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#131317'
  on-background: '#e5e1e7'
  surface-variant: '#353439'
  telemetry-cyan: '#00f2fe'
  telemetry-azure: '#38bdf8'
  aurora-violet: '#9d4edd'
  status-warning: '#c86a50'
  surface-glass: rgba(255, 255, 255, 0.03)
  border-glass: rgba(255, 255, 255, 0.08)
  border-glass-active: rgba(0, 242, 254, 0.35)
  text-dim: '#71717a'
  text-bright: '#f4f4f5'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
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
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the calculated precision of an advanced orbital dynamics terminal crossed with the ethereal beauty of deep space instrumentation. Tailored for deep-tech engineers, aerospace operators, and high-performance system architects, the aesthetic balances sterile functional telemetry with atmospheric, futuristic elegance.

The visual style is rooted in **Precision Dark Minimalist Glassmorphism**. The foundation is absolute void (`#050508`) overlaid with fine radial dot-matrix coordinates, subtle structural hairline framing, and dynamic, ultra-soft aurora mesh glows. The UI eliminates visual noise, elevating telemetry readouts, orbital vectors, and critical actions through translucent materials, crystalline borders, and laser-precise technical typography.

## Colors

The palette is tuned for high-contrast visibility against an obsidian void.
- **Primary (`#00f2fe`)**: Electric cyan; used for active flight paths, critical affirmative actions, telemetry live-states, and high-priority indicators.
- **Secondary (`#9d4edd`)**: Deep spectral violet; creates atmospheric depth in background aurora meshes and serves as structural secondary metadata accents.
- **Tertiary (`#38bdf8`)**: Neon azure; provides supplemental tracking data, secondary selections, and interactive hover states.
- **Neutral (`#050508`)**: Deep obsidian base; an ultra-deep black serving as canvas for radial grid matrix overlays and ambient backlights.
- **Functional Accents**: `telemetry-cyan` and `aurora-violet` combine to form gradient atmospheric glows. `status-warning` (`#c86a50`) provides measured operational warnings without breaking monochromatic composure.

## Typography

Typography establishes an intentional operational dichotomy between human-readable interfaces and numerical telemetry.
- **Geist** delivers crisp, optical precision for headers and major titles, featuring negative tracking to mimic high-end technical apparatus displays.
- **Inter** ensures effortless legibility for long-form documentation, mission logs, and standard narrative body copy.
- **JetBrains Mono** powers operational instrumentation: timestamps, geographic/orbital coordinates, status codes, telemetry metrics, and UI micro-labels. All numerical labels and metric values must strictly render in JetBrains Mono with proportional tabular figures.

## Layout & Spacing

The system runs on a 12-column dynamic grid bounded by high-density operational rails.
- **Canvas Matrix**: The canvas background incorporates an ultra-subtle radial dot matrix pattern spaced every 24px (`rgba(255, 255, 255, 0.05)`).
- **Rhythm**: Spacing enforces modular rhythm using strict 4px/8px increments.
- **Desktop (1200px+)**: 12-column layout with 24px (`space-lg`) gutters and generous 48px (`margin`) boundary insets, allowing telemetry panels to float over background ambient meshes.
- **Tablet (768px - 1199px)**: 8-column layout with 16px (`space-md`) gutters and 24px outer margins.
- **Mobile (< 768px)**: 4-column layout with 12px gutters and 16px screen padding; telemetry data strips collapse into horizontally scrollable ticker rows.

## Elevation & Depth

Visual depth is achieved through layered translucent optical filters and directional aurora light fields rather than opaque drop shadows:

1. **Layer 0 (Void)**: Obsidian ground (`#050508`) with 24px radial dot coordinates.
2. **Layer 1 (Atmosphere)**: Dual ambient conic/radial meshes (`#00f2fe` at 10% opacity, `#9d4edd` at 12% opacity) blurred at `120px` to create deep-field luminescence.
3. **Layer 2 (Plates / Cards)**: Glassmorphic surfaces composed of `rgba(255, 255, 255, 0.03)` backed by `backdrop-blur-2xl` (40px) and edged with a continuous 1px hairline border of `rgba(255, 255, 255, 0.08)`.
4. **Layer 3 (Floating HUD / Overlays)**: `rgba(255, 255, 255, 0.06)`, `backdrop-blur-3xl`, a glowing cyan edge feather (`box-shadow: inset 0 1px 0 rgba(0, 242, 254, 0.25), 0 16px 32px -8px rgba(0, 0, 0, 0.7)`).
5. **Interactive Glow**: Active and focused elements cast an ethereal ambient aura using `box-shadow: 0 0 24px rgba(0, 242, 254, 0.2)`.

## Shapes

The interface balances generous hardware-like enclosures with clinical micro-elements:
- **Major Enclosures & HUD Modules**: Utilize `rounded-3xl` (24px to 32px radii), presenting smooth, pebble-like glass viewports reminiscent of aerospace observation apertures.
- **Interactive Controls & Chips**: Maintain rounded pill forms (`rounded-full`) for badges, trigger buttons, and mode switches.
- **Internal Data Cells**: Inside larger containers, nested telemetry blocks use soft radii (8px) to prevent nested border curve clashes while retaining a unified geometric harmony.

## Components

### Buttons & Interactive Triggers
- **Primary Flight Trigger**: Gradient background (`linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)`), text color `#050508`, JetBrains Mono medium font, `rounded-full`, subtle cyan outer aura. On hover, luminance expands with an ambient glow blur of 20px.
- **Secondary Ghost**: `bg-white/[0.03]`, `border border-white/[0.08]`, text `#f4f4f5`, backdrop blur. On hover: `border-[#00f2fe]/40`, `bg-white/[0.06]`.

### Telemetry Cards & Viewports
- Formed with `bg-white/[0.03]`, `backdrop-blur-2xl`, `border border-white/[0.08]`, and `rounded-3xl` geometry.
- Headers within cards feature uppercase `label-md` tracking identifiers accompanied by pulsing green/cyan live status pings (4px indicator dots).

### Chips & Status Badges
- Pill-shaped badges using `JetBrains Mono` label-sm uppercase.
- Telemetry lock status: `border border-[#00f2fe]/30 bg-[#00f2fe]/10 text-[#00f2fe]`.
- Passive state: `border border-white/10 bg-white/[0.02] text-zinc-400`.

### Form Inputs & Terminal Fields
- Dark translucent containers (`bg-black/40`), `border border-white/10`, `rounded-xl`, text `Inter` body-md.
- Focus state activates an electric cyan hairline border (`#00f2fe`) and a subtle `0 0 16px rgba(0, 242, 254, 0.15)` internal-external gradient halo. Monospaced unit suffixes (e.g., `KM/S`, `DEG`, `UTC`) sit locked to the right margin.

### Checkboxes & Segmented Controls
- Segmented switches run as pill tracks (`rounded-full`, `bg-white/[0.04]`, `p-1`) enclosing an active pill slider (`bg-white/[0.12]`, `backdrop-blur-md`, `border border-white/[0.15]`).
- Checkboxes are 16px squares with soft 4px corners; when checked, filled with `#00f2fe` showing an obsidian tick icon.

### Orbital Telemetry HUD Modules (Specialized Component)
- Segmented horizontal coordinate bars with hairline crosshairs, real-time numeric readouts in `JetBrains Mono`, and vector trajectory lines with glowing linear gradients fading to zero opacity at extremes.