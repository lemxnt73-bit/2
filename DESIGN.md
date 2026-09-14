# Design Brief

## Direction

Tactical Market — a clean, trustworthy Thai-language marketplace for BB guns and second-hand airsoft gear, built on grounded outdoor tones with a sharp safety-orange accent.

## Tone

Grounded, dependable, and utilitarian — olive-charcoal neutrals with a single high-visibility orange accent read as "gear marketplace," not generic e-commerce.

## Differentiation

Product-card hierarchy is the hero: uniform image-first cards with a bold price tag in safety orange and a crisp olive "ลงประกาศ" (post listing) call-to-action that makes the marketplace feel instantly trustworthy and shopable.

## Color Palette

| Token      | OKLCH        | Role                                  |
| ---------- | ------------ | ------------------------------------- |
| background | 0.98 0.008 90| warm olive-tinted off-white           |
| foreground | 0.18 0.02 110| deep olive-charcoal text              |
| card       | 1.0 0.004 90 | elevated product/listing surface      |
| primary    | 0.36 0.06 130| olive green — trust, post listing     |
| accent     | 0.65 0.17 45 | safety orange — price, active states  |
| muted      | 0.95 0.012 90| secondary surfaces / footer           |

## Typography

- Display: Space Grotesk — headings, hero, product titles (Thai fallback Noto Sans Thai)
- Body: DM Sans — paragraphs, UI labels, cards (Thai fallback Noto Sans Thai / Tahoma)
- Mono: JetBrains Mono — prices, condition tags, seller handles
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Flat, layered surfaces with subtle `shadow-subtle` on resting cards and `shadow-elevated` on hover — depth comes from card stacking and borders, not heavy shadows.

## Structural Zones

| Zone    | Background  | Border   | Notes                                   |
| ------- | ----------- | -------- | --------------------------------------- |
| Header  | bg-card     | border-b | sticky, contains brand + nav + CTA      |
| Content | bg-background | —      | category filter bar on bg-muted/40      |
| Footer  | bg-muted/40 | border-t | muted, contains about + legal links     |

## Spacing & Rhythm

Spacious section gaps (py-16/24), a tight 4px grid for card internals, 12px for card padding, and 24px between grid items — clear breathing room around product images.

## Component Patterns

- Buttons: rounded-md; primary olive for "ลงประกาศ", orange for "ติดต่อผู้ขาย" (contact seller); hover darkens
- Cards: rounded-lg, bg-card, shadow-subtle resting → shadow-elevated + -translate-y on hover
- Badges: rounded-full pills — olive for category, orange for condition/price highlights

## Motion

- Entrance: `animate-fade-up` on grid items, staggered ~50ms
- Hover: cards lift 2px + shadow-elevated, 0.3s `transition-smooth`
- Decorative: none — restraint keeps the marketplace trustworthy

## Constraints

- Thai text must stay legible: always include Noto Sans Thai/Tahoma fallbacks
- No chat, reviews, or seller-rating UI (out of scope)
- Product cards must keep image-first hierarchy on mobile and desktop
- Use semantic tokens only — no raw hex or arbitrary color classes

## Signature Detail

The safety-orange price tag pinned to every product card — a single high-visibility accent that makes scanning and comparing listings effortless.
