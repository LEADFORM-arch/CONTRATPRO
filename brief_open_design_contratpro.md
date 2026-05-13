# OPEN DESIGN BRIEF — CONTRATPRO
## For Codex (VS Code) + Open Design Framework
### Project: SaaS HVAC Maintenance Contracts — France

---

## 1. PROJECT IDENTITY

```yaml
name: ContratPro
type: SaaS Dashboard + Marketing Site
sector: HVAC Maintenance (Chauffage, Ventilation, Climatisation)
market: France — Independent heating contractors (artisans, TPE)
positioning: "Gagnez du temps, gagnez des clients, ne perdez plus un contrat"
differentiation: "Mobile-first, zero formation, fait pour le terrain"
```

---

## 2. DESIGN PHILOSOPHY (Non-negotiable)

### Core Principles

| # | Principle | Application |
|---|-----------|-------------|
| 1 | **Speed over Everything** | The user is in a van between two clients. Every action must be < 3 taps. |
| 2 | **Reliability over Beauty** | It must WORK, every time, offline if needed. Trust through consistency. |
| 3 | **Clarity over Density** | No learning curve. If a chauffagiste can't use it after 2 minutes, it fails. |
| 4 | **Mobile-first, Desktop-second** | 70% of usage is on smartphone. Desktop is for invoicing at the office. |

### Emotional Tone
- **NOT**: Corporate, complex, "software for software's sake"
- **NOT**: Playful, cartoonish, childish
- **YES**: Competent, reassuring, no-nonsense, "this guy knows his stuff"

---

## 3. MOOD REFERENCES (Visual Anchors)

### What to Emulate

| Reference | Element to Capture | Why |
|-----------|-------------------|-----|
| **Dext** | Clean data entry, clear validation, no fluff | Chauffagistes already know accounting apps |
| **Notion** | Clarity, whitespace, information hierarchy | Reduces cognitive load |
| **SNCF Connect** | French reliability, functional blue, trustworthy | Familiar to French users |
| **iOS Settings** | Direct, scannable, action-oriented | Users are on iPhone/Android |

### What to AVOID

| Reference | Problem | Why Avoid |
|-----------|---------|-----------|
| EBP / Sage | Dense, complex, Windows 95 aesthetic | Competitor we differentiate from |
| Generic SaaS (purple gradients) | Interchangeable, forgettable | ContratPro must be unmistakable |
| Bank apps | Cold, anxiety-inducing, slow | Wrong emotional register |

---

## 4. COLOR SYSTEM

### Primary Palette

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `color-navy` | `#1E3A5F` | Primary text, headings, sidebar | Deep blue = trust, reliability, French tech |
| `color-white` | `#FFFFFF` | Background primary | Clean, pure, no distraction |
| `color-surface` | `#F8FAFC` | Background secondary, cards | Slightly off-white for depth |
| `color-green` | `#2D8A5E` | Success, active contracts, validation | Energy, ecology, HVAC, "go" |
| `color-green-light` | `#E8F5EE` | Success backgrounds, badges | Soft confirmation |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | `#2D8A5E` | Contract active, intervention done, paid |
| `color-warning` | `#E67E22` | Contract expiring < 45 days, pending action | Orange = attention, not panic |
| `color-error` | `#C0392B` | Overdue, failed payment, critical alert | Red = stop, action needed NOW |
| `color-info` | `#3B82F6` | Information, links, secondary actions | Standard blue, familiar |

### Dark Mode (Phase 2)

| Token | Hex | Usage |
|-------|-----|-------|
| `color-dark-bg` | `#0F172A` | Background |
| `color-dark-surface` | `#1E293B` | Cards, panels |
| `color-dark-text` | `#F1F5F9` | Primary text |

---

## 5. TYPOGRAPHY SYSTEM

### Font Families

| Role | Font | Fallback | Weight | Rationale |
|------|------|----------|--------|-----------|
| **ALL TEXT** | Inter | system-ui, sans-serif | 400, 500, 600, 700 | One font only. Maximum readability. No serif. |

### Type Scale (6 sizes)

| Token | Size | Line-Height | Letter-Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `text-hero` | 40px / 2.5rem | 1.1 | -0.02em | Landing hero headline |
| `text-h1` | 28px / 1.75rem | 1.2 | -0.01em | Page titles |
| `text-h2` | 22px / 1.375rem | 1.3 | 0 | Section headings |
| `text-h3` | 18px / 1.125rem | 1.4 | 0 | Card titles, form sections |
| `text-body` | 16px / 1rem | 1.5 | 0 | Body text, descriptions |
| `text-small` | 14px / 0.875rem | 1.4 | 0.01em | Labels, metadata, captions |
| `text-xs` | 12px / 0.75rem | 1.3 | 0.02em | Badges, timestamps, legal |

### Typography Rules
- **One font only**: Inter. No exceptions.
- **Line-height tight**: 1.5 max. Chauffagistes scroll fast.
- **Weight 600 for emphasis**: Never 700 except hero.
- **All-caps for labels**: `text-small`, weight 600, letter-spacing 0.05em, color-navy/50%

---

## 6. SPACING SYSTEM

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Inline spacing, small gaps |
| `space-3` | 12px | Button padding vertical |
| `space-4` | 16px | Card padding, form gaps |
| `space-5` | 20px | Section gaps, list spacing |
| `space-6` | 24px | Component separation |
| `space-7` | 32px | Section breaks |
| `space-8` | 40px | Major section padding |
| `space-9` | 64px | Hero spacing, page breaks |

### Layout Grid
- **Desktop**: 12-column, max-width 1200px, gutter 20px
- **Tablet**: 8-column, gutter 16px
- **Mobile**: 4-column, gutter 12px, padding 16px

**Rule**: Mobile cards have NO horizontal margin — full-bleed for maximum content width.

---

## 7. SHADOWS & ELEVATION

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(30,58,95,0.05)` | Subtle depth |
| `shadow-md` | `0 2px 8px rgba(30,58,95,0.08)` | Cards, dropdowns |
| `shadow-lg` | `0 4px 16px rgba(30,58,95,0.10)` | Modals, popovers |
| `shadow-xl` | `0 8px 32px rgba(30,58,95,0.12)` | Full-screen overlays |

**Rule**: Shadows are ALWAYS blue-tinted (based on navy), never grey.

---

## 8. BORDERS & RADIUS

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Buttons, inputs, badges |
| `radius-md` | 8px | Cards, panels |
| `radius-lg` | 12px | Modals, large containers |
| `radius-xl` | 16px | Hero sections |
| `radius-full` | 9999px | Pills, avatars, status indicators |

**Border color**: `rgba(30,58,95,0.08)` — barely visible, structural only.

---

## 9. TEXTURE & ATMOSPHERE

### Rule: NO TEXTURE

ContratPro is NOT Memoria. The user is in a van, on a construction site, with dirty hands. The interface must be:
- **Clean** — no grain, no paper, no organic shapes
- **Flat** — shadows only for elevation, never for decoration
- **High contrast** — readable in sunlight, readable with gloves

### Visual Language
- **Sharp edges** — no soft focus, no blur
- **Solid colors** — no gradients except subtle navy → darker navy on hero
- **Icon + text** — never icon alone (users may not understand)

---

## 10. COMPONENT SPECIFICATIONS

### 10.1 Button

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **Primary** | `color-navy` | `#FFFFFF` | none | Lighten 10%, shadow-md |
| **Secondary** | `color-surface` | `color-navy` | 1px `color-navy`/20% | Fill `color-navy`/5% |
| **Success** | `color-green` | `#FFFFFF` | none | Darken 10% |
| **Danger** | `color-error` | `#FFFFFF` | none | Darken 10% |
| **Ghost** | transparent | `color-navy` | none | Underline |

**Shape**: `radius-sm` (6px) — slightly rounded, not playful
**Padding**: `space-3` vertical (12px), `space-4` horizontal (16px)
**Typography**: `text-small`, weight 600, uppercase for action buttons

**Button text rule**: IMPERATIVE verbs only.
- ✅ "CRÉER UN CONTRAT", "ENVOYER", "VALIDER", "TÉLÉCHARGER"
- ❌ "Découvrir", "Explorer", "En savoir plus"

### 10.2 Card

```
Background: color-white
Border: 1px solid rgba(30,58,95,0.06)
Radius: radius-md (8px)
Shadow: shadow-sm at rest, shadow-md on hover
Padding: space-4 (16px) mobile, space-5 (20px) desktop
Transition: shadow 150ms ease
Hover: shadow-md (NO translateY — mobile stability)
```

### 10.3 Data Table

```
Header: Background color-surface, text color-navy/60%, text-small, weight 600, uppercase
Row: Background color-white, border-bottom 1px rgba(30,58,95,0.04)
Row hover: Background color-surface
Selected row: Left border 3px color-green
Empty state: Centered icon + action button (NOT just text)
Mobile: Cards list, NOT table — full width, stacked
```

### 10.4 Form / Input

```
Background: color-white
Border: 1px solid rgba(30,58,95,0.15)
Border focus: 2px solid color-navy
Radius: radius-sm (6px)
Padding: space-3 (12px) vertical, space-4 (16px) horizontal
Label: text-small, color-navy/70%, weight 600, uppercase, above input
Placeholder: color-navy/30%
Error: Border color-error, message text-small color-error
```

**Mobile rule**: Input height minimum 48px for thumb tapping.

### 10.5 Modal / Dialog

```
Overlay: rgba(15,23,42,0.50) — dark navy, not pure black
Background: color-white
Radius: radius-lg (12px)
Shadow: shadow-xl
Padding: space-6 (24px)
Animation: Fade in 150ms + scale from 0.98 to 1.00
Close button: Top-right, ghost style, large touch target (44px)
```

### 10.6 Navigation (Sidebar)

```
Background: color-navy
Width: 220px (desktop), full-screen overlay (mobile)
Item: Padding space-3 vertical, space-4 horizontal
Item hover: Background rgba(255,255,255,0.08)
Item active: Background rgba(255,255,255,0.12), left border 3px color-green
Icon: 20px, rgba(255,255,255,0.60%) (inactive), #FFFFFF (active)
Text: text-small, #FFFFFF/80% (inactive), #FFFFFF (active)
Divider: 1px solid rgba(255,255,255,0.08)
```

**Mobile**: Hamburger menu, slide from left, overlay backdrop.

### 10.7 Badge / Status

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Actif | `color-green`/15% | `color-green` | CheckCircle |
| En attente | `color-warning`/15% | `color-warning` | Clock |
| Expiré | `color-error`/15% | `color-error` | XCircle |
| Renouvellement | `color-warning`/15% | `color-warning` | AlertCircle |
| Payé | `color-green`/15% | `color-green` | CheckCircle2 |
| Impayé | `color-error`/15% | `color-error` | AlertTriangle |

### 10.8 Empty State

```
Icon: 48px, color-navy/20%
Headline: text-h3, color-navy, action-oriented
Description: text-body, color-navy/60%, brief explanation
Action: Primary button with IMPERATIVE text
Example: "Aucun contrat actif" + "CRÉER MON PREMIER CONTRAT"
```

**Rule**: Empty states MUST have a primary action button. Never dead-end.

### 10.9 KPI Card (Dashboard)

```
Background: color-white
Border: 1px solid rgba(30,58,95,0.06)
Radius: radius-md (8px)
Padding: space-4 (16px)
Icon: 24px, top-right, color-navy/20%
Value: text-h1, color-navy, weight 700
Label: text-small, color-navy/60%, uppercase
Trend: text-small, color-green or color-error, with arrow icon
```

---

## 11. ANIMATION & MOTION

### Principles
- **Fast**: 150ms max. Chauffagistes have no patience.
- **Functional**: Every animation guides or confirms.
- **Subtle**: Never decorative, never playful.

### Specifications

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade in | 150ms | ease-out | Page transitions, modals |
| Slide in | 200ms | ease-out | Sidebar, mobile menu |
| Scale press | 100ms | ease-in-out | Button active state |
| Shadow lift | 150ms | ease | Card hover (desktop only) |
| Skeleton pulse | 1200ms | ease-in-out infinite | Loading states |
| Toast slide | 200ms | ease-out | Notifications |

### Loading States
- **NEVER**: Spinning loaders (feel slow)
- **ALWAYS**: Skeleton screens or progress bars
- **Text**: "Chargement..." — never technical

---

## 12. LANDING PAGE STRUCTURE

### Section 1: Hero

```
Background: color-navy (solid) OR subtle gradient navy → darker navy
Headline: text-hero, #FFFFFF, Inter, weight 700
  "Ne perdez plus un contrat. Gagnez du temps."
Subheadline: text-body, #FFFFFF/80%, max-width 520px
  "ContratPro centralise vos contrats d'entretien CVC, vos interventions,
   vos attestations et vos relances — sur téléphone et ordinateur."
CTA Primary: "ESSAYER GRATUITEMENT" — Success variant (green)
CTA Secondary: "VOIR LA DÉMO" — Ghost on dark
Trust badges: "200€/mois", "Sans engagement", "30 jours d'essai"
Visual: Screenshot app on phone + desktop, or abstract HVAC illustration
```

### Section 2: Problem / Solution

```
Layout: Mobile — stacked. Desktop — 2-column (text left, visual right)
Headline: text-h2, color-navy
  "Vous perdez du temps sur l'administratif ?"
Body: 3 pain points with icons
  • "Excel partagé qui plante" → Icon: FileX
  • "Contrats qui expirent sans relance" → Icon: CalendarX
  • "Attestations en retard, clients mécontents" → Icon: AlertTriangle
Visual: Before/After or app screenshot
```

### Section 3: Features (3 cards)

```
Card 1: "Contrats en ligne" — Icon: FileText, Color: color-navy
Card 2: "Interventions planifiées" — Icon: CalendarCheck, Color: color-green
Card 3: "Relances automatiques" — Icon: Send, Color: color-warning
Card 4: "Attestations PDF" — Icon: FileCheck, Color: color-info
Card 5: "Paiement SEPA" — Icon: CreditCard, Color: color-navy
Card 6: "Tableau de bord" — Icon: BarChart3, Color: color-green
```

### Section 4: Testimonial

```
Background: color-surface
Quote: text-h3, color-navy, weight 500
  "Avant ContratPro, je passais 2 heures par semaine sur mes contrats.
   Maintenant, c'est 10 minutes. Et je n'ai plus oublié de relance."
Attribution: text-small, name + "Chauffagiste indépendant" + city
Avatar: Rounded, real photo (not stock), work context
```

### Section 5: Pricing

```
Headline: text-h2, "Un prix simple, sans surprise"
Card: Pro tier highlighted
  • "ContratPro Pro" — 200€/mois
  • "Tout inclus" — checkmarks
  • CTA: "COMMENCER L'ESSAI"
Secondary: "Questions ? Contactez-nous" — link
```

### Section 6: FAQ + Final CTA

```
FAQ: Accordion, minimal, text-body
Final CTA: "Prêt à ne plus perdre de contrats ?"
Button: Primary, large, "ESSAYER GRATUITEMENT"
Footer: Minimal, color-navy background, white text
```

---

## 13. DASHBOARD LAYOUT

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (mobile: sticky)                                │
│  Logo | Search | Notifications | Profile                │
├─────────────────────────────────────────────────────────┤
│  SIDEBAR (desktop: 220px)     │  MAIN CONTENT          │
│  ─────────────────────────    │  ────────────────────  │
│  ContratPro (logo)            │  KPI Cards (4)         │
│  ─────────────────────────    │  ────────────────────  │
│  Dashboard                    │  Quick Actions         │
│  Contrats                     │  ────────────────────  │
│  Interventions                │  Recent Activity       │
│  Clients                      │  ────────────────────  │
│  Attestations                 │  Renewal Alerts        │
│  Paiements                    │                        │
│  ─────────────────────────    │                        │
│  Paramètres                   │                        │
│  Déconnexion                  │                        │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
- Hamburger menu for sidebar
- KPI cards: 2x2 grid, then stack
- Tables become card lists with swipe actions
- Floating Action Button (FAB) for primary action
- Bottom tab bar for main sections (optional)

### KPI Cards (Top of Dashboard)

| Card | Value | Icon | Color |
|------|-------|------|-------|
| Contrats actifs | Number | FileText | color-navy |
| Interventions ce mois | Number | Wrench | color-green |
| Relances en attente | Number | Send | color-warning |
| CA mensuel | € amount | Euro | color-navy |

---

## 14. ICONOGRAPHY

### Style
- **Library**: Lucide React (line style, NOT filled)
- **Stroke width**: 2px (slightly heavier for visibility)
- **Size**: 20px default, 24px for features, 16px for inline
- **Color**: Inherit from text color

### Key Icons Mapping

| Feature | Icon | Rationale |
|---------|------|-----------|
| Dashboard | LayoutDashboard | Overview |
| Contrats | FileText | Document |
| Interventions | Wrench | Tool, work |
| Clients | Users | People |
| Attestations | FileCheck | Verified document |
| Paiements | CreditCard | Transaction |
| Calendar | Calendar | Dates |
| Search | Search | Discovery |
| Filter | SlidersHorizontal | Refinement |
| More | MoreVertical | Options |
| Alert | AlertTriangle | Warning |
| Success | CheckCircle2 | Confirmation |
| Error | XCircle | Problem |
| Send | Send | Action |
| Download | Download | Export |
| Print | Printer | Physical output |
| Phone | Phone | Contact |
| Email | Mail | Communication |
| Location | MapPin | Address |
| Settings | Settings | Configuration |
| Logout | LogOut | Exit |

---

## 15. RESPONSIVE BREAKPOINTS

| Name | Width | Key Changes |
|------|-------|-------------|
| `mobile` | < 640px | Single column, hamburger nav, stacked cards, FAB |
| `tablet` | 640px - 1024px | 2-column grids, condensed sidebar |
| `desktop` | 1024px - 1280px | Full layout, sidebar visible |
| `wide` | > 1280px | Max-width container, side margins |

**Mobile-first rule**: Design for 375px width first. Everything must work on a small phone in a van.

---

## 16. ACCESSIBILITY

### Requirements
- **Contrast**: WCAG 2.1 AA minimum (4.5:1 for text)
- **Focus states**: 2px outline `color-navy`, offset 2px
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Screen readers**: All icons have aria-labels
- **Touch targets**: Minimum 48x48px for mobile
- **Sunlight readability**: High contrast mode, no grey-on-grey

---

## 17. DELIVERABLES EXPECTED

From Codex + Open Design, generate:

1. **DESIGN.md** — Complete design system documentation
2. **tailwind.config.ts** — Custom theme extension with ContratPro tokens
3. **app/globals.css** — Global styles, CSS variables, font imports
4. **components/ui/button.tsx** — All variants (Primary, Secondary, Success, Danger, Ghost)
5. **components/ui/card.tsx** — Card component
6. **components/ui/input.tsx** — Form input with focus states
7. **components/ui/badge.tsx** — Status badges (Actif, En attente, Expiré, etc.)
8. **components/ui/modal.tsx** — Dialog/Modal
9. **components/ui/table.tsx** — Data table with row hover and selection
10. **components/ui/sidebar.tsx** — Navigation sidebar (dark navy)
11. **components/ui/empty-state.tsx** — Actionable empty state
12. **components/ui/kpi-card.tsx** — Dashboard KPI card
13. **app/landing/page.tsx** — Landing page with all 6 sections
14. **app/dashboard/layout.tsx** — Dashboard shell with sidebar

---

## 18. CRITICAL REMINDERS

- [ ] **NO serif fonts** — Inter ONLY
- [ ] **NO paper texture, NO grain, NO organic shapes** — clean flat surfaces
- [ ] **Primary color is NAVY (#1E3A5F)**, NOT purple, NOT indigo
- [ ] **Mobile-first** — 70% of users on phone in van
- [ ] **Button text is IMPERATIVE** — "CRÉER", "ENVOYER", "VALIDER"
- [ ] **Empty states are ACTIONABLE** — always a primary CTA button
- [ ] **Animations max 150ms** — fast, functional, never decorative
- [ ] **High contrast** — readable in sunlight, readable with dirty screen
- [ ] **Touch targets 48px minimum** — thumb-friendly
- [ ] **NO dead-ends** — every screen has a clear next action

---

*Brief prepared by: Associate Designer*
*Date: May 2026*
*Version: 1.0 — For Open Design Framework + Codex*
*Project: ContratPro — SaaS HVAC Maintenance Contracts*
