---
name: Aegean Building Info
description: Permanent QR door signage for ΤΠΤΕ, University of the Aegean; every screen is a door plate.
colors:
  sea: "#156ba8"
  sea-deep: "#0d4c7c"
  sea-2: "#1a74b5"
  stone: "#a2a39a"
  stone-soft: "#dcddd5"
  stone-ink: "#5f6058"
  ink: "#15222e"
  muted: "#565b62"
  paper: "#f4f4f0"
  paper-2: "#eaeae4"
  card: "#fdfdfb"
  line: "#e0e0d9"
  line-strong: "#c8c9c0"
  ok: "#2d6a43"
  ok-bg: "#e5f0e6"
  danger: "#a1302a"
  danger-bg: "#f8e6e3"
  warn: "#8a5a00"
  warn-bg: "#fbefd2"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "4.75rem"
    fontWeight: 500
    lineHeight: 0.82
    letterSpacing: "-0.02em"
    fontFeature: "\"lnum\" 1, \"kern\" 1, \"tnum\" 1"
  headline:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "2.125rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  page-title:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
  section:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  numeral-row:
    fontFamily: "EB Garamond, Georgia, Times New Roman, serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "\"lnum\" 1, \"tnum\" 1"
  lead:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-control:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.35
  caption:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
  tag:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.025em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  stack: "20px"
  card-pad: "20px"
  column: "42rem"
components:
  button-primary:
    backgroundColor: "{colors.sea}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.sea-2}"
  button-primary-active:
    backgroundColor: "{colors.sea-deep}"
  button-sea:
    backgroundColor: "{colors.sea-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-sea-hover:
    backgroundColor: "{colors.sea}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.sea}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.card}"
    textColor: "{colors.danger}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  text-input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.body-control}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
  contact-action-primary:
    backgroundColor: "{colors.sea}"
    textColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "0 16px"
    height: "68px"
  contact-action:
    backgroundColor: "{colors.card}"
    textColor: "{colors.sea}"
    rounded: "{rounded.2xl}"
    padding: "0 16px"
    height: "68px"
  badge-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "22px"
  badge-stone:
    textColor: "{colors.stone-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "22px"
  plate:
    backgroundColor: "{colors.sea}"
    textColor: "#ffffff"
    typography: "{typography.headline}"
    padding: "28px 16px 32px"
  card-list:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.2xl}"
  form-section:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Aegean Building Info

## Overview

**Creative North Star: "The Door Plate"**

The printed door plaque is the system. Every screen opens on a plate: a sea-blue field, a room numeral set large in pale stone Garamond, the occupant's name in white, a grey hairline that engraves itself in on first paint, and a 6px grey bar closing the field. Below the plate the world turns to neutral paper: near-white cards with hairline dividers, Source Sans 3 for everything a hand operates. The same plate appears on the phone at the door, in the back-office editor as a live preview, and on the PNG plaque that gets printed and screwed to the wall; the three are one object at three scales.

The palette is pinned to the ΤΠΤΕ department logo across the whole app: the logo's sea blue for fields and actions, the logo's grey for rules, bars and the printed QR. It replaces the earlier navy and gold; the character is otherwise kept. Density is low on public pages (one 42rem column, large tap targets, one primary action) and moderate in the back office (a 16rem deep-sea rail, card form sections, side-by-side Greek and English fields). The tone is academic and calm: no gradients on the plate, no glow, no decorative imagery. Depth is soft and sea-tinted on paper.

**Key Characteristics:**
- Sea-blue plate fields bounded by logo grey: hairline above the name, 6px bar below the field.
- Room numerals in EB Garamond lining, tabular figures: stone-soft on sea, stone-ink on paper.
- Names and titles in Garamond; every control, label and value in Source Sans 3.
- Neutral paper ground, near-white cards, hairline dividers in pale stone.
- Soft sea-tinted shadows; flat plate fields.
- Bilingual Greek/English as the default layout, not a tab.

## Colors

The two logo colours, sea blue and stone grey, carried on a neutral paper family, with three muted status pairs.

### Primary
- **Logo Sea** (sea): the plate field, the primary button, the primary Call action, links and active text on paper, the printed plaque field and the frame around its mark.
- **Deep Sea** (sea-deep): the masthead strip, the admin rail and its mobile bar, the login field, toasts and the save bar, pressed states. One step darker than the plate so the plate reads as the object sitting on it.
- **Bright Sea** (sea-2): hover for sea surfaces, focus outlines, input focus border and caret.

### Secondary
- **Logo Stone** (stone): the 6px plate bar, the engraved hairline (at 80%), the icon disc on the primary contact action, the plaque's top and bottom bars, stone badges (at 20%).
- **Pale Stone** (stone-soft): room numerals on sea, active rail icons, the save bar's dirty dot, the toast check, focus outlines inside `.on-sea`.
- **Engraved Stone** (stone-ink): room numerals and stone badges on paper; the printed QR modules (about 6:1 on the white well).

### Neutral
- **Ink** (ink): body text on paper and card.
- **Slate** (muted): secondary text, definition terms, hints, footers.
- **Paper** (paper): the page ground everywhere outside the plate and the rail.
- **Deep Paper** (paper-2): inset surfaces: segmented-control track, neutral badges, icon discs on paper, language tags, skeleton base.
- **Card** (card): cards, list containers, form sections, secondary buttons.
- **Hairline** (line): card borders and row dividers.
- **Strong Hairline** (line-strong): control borders, the secondary button stroke, chevrons in list rows, scrollbar thumb.
- **Status pairs** (ok / ok-bg, danger / danger-bg, warn / warn-bg): published state and switches; errors and destructive actions; warnings such as a code change that would break printed QRs. Always text-on-tint, never a saturated fill except the armed delete confirm and the "on" switch.

### Named Rules
**The Two Stones Rule.** Stone on sea is stone-soft, and only at display size (numerals) or as icons and dots; stone on paper is stone-ink. Logo Stone itself is a fill (bars, rules, discs), never text.

**The White on Sea Rule.** Primary text on any sea field is white. Secondary text on a sea field is white at 90%; on a deep-sea field (masthead, rail, login) it is at least white at 75%. Nothing lighter carries words.

**The Plate Owns the Sea Rule.** Large sea fields appear only as the plate, the home header, building cards on the home page, the masthead, the admin rail, the login field and transient bars (toast, save bar). Content cards on paper stay card-white.

## Typography

**Display Font:** EB Garamond (with Georgia, Times New Roman, serif), weights 500 and 600
**Body Font:** Source Sans 3 (with system-ui, sans-serif), weights 400 to 700

**Character:** A classical book face for what is engraved (numbers and names) against a clear humanist sans for what is read and operated. Both carry full Greek; the Garamond is set with lining, kerned figures (`font-display` utility) so "1.1.1" reads like a cast numeral, not oldstyle text.

### Hierarchy
- **Display** (EB Garamond 500, 4.75rem mobile to 6rem at sm, line-height 0.82, -0.02em): the room numeral on the plate. Drops to 3.5rem / 4.5rem when the code is longer than five characters, and to 3rem on compact plates; building codes on home cards are 3.75rem. The login field carries the ramp's largest numeral, a 7.5rem specimen plate.
- **Headline** (EB Garamond 600, 2.125rem to 3rem, line-height 1.05, -0.01em): the occupant or space name on the plate. The home header title is the same role at 2.5rem to 3.25rem, line-height 1.02.
- **Page title** (EB Garamond 600, 2rem to 2.5rem from 1024px, line-height 1.25): back-office page titles and the sign-in heading.
- **Section** (EB Garamond 600, 1.75rem): public section headings on building and home pages.
- **Title** (EB Garamond 600, 1.25rem): empty-state titles and small display moments.
- **Numeral row** (EB Garamond 500, 1.375rem, lining tabular, stone-ink): the door code column in directory rows.
- **Lead** (Source Sans 3 400, 1.0625rem, line-height 1.625): plate subtitles (to 1.125rem at sm), header lead copy, the contact action value, the home search field.
- **Body** (Source Sans 3 400, 1rem, line-height 1.5): content values.
- **Control** (Source Sans 3 400, 0.9375rem): input text, rail links, descriptive copy in cards.
- **Small** (Source Sans 3 400, 0.875rem): secondary lines under a row headline, addresses, table cells; also the md button label.
- **Label** (Source Sans 3 600, 0.8125rem): field labels, definition terms, plate meta, hints, footer. Sentence case, no tracking.
- **Caption** (Source Sans 3 600, 0.75rem): badges and segment counts.
- **Tag** (Source Sans 3 700, 0.6875rem, 0.025em): the ΕΛ / EN language tag on bilingual field labels. The only tracked text.

### Named Rules
**The Engraved and the Operated Rule.** Garamond is for numerals and names only. Buttons, inputs, labels, navigation and values are Source Sans 3. If you can tap it, it is sans.

**The Lining Figures Rule.** Every room code, phone number and count uses lining tabular figures (`nums`). Oldstyle figures on a door number are a bug, including on the canvas plaque (the fonts must be loaded before drawing).

## Layout

Public pages are a single centred column (max-width 42rem) with 16px gutters on mobile and 24px from 640px. The page stacks: masthead strip (64px), full-bleed plate, then cards at 20px vertical rhythm, then a hairline-topped footer. Contact actions are a full-width stack on narrow phones and split into equal columns from 440px. Definition rows go from stacked to a 9rem term column at 640px.

The back office is a 16rem deep-sea rail plus a paper canvas from 1024px; below that the rail becomes a 56px top bar with a slide-in menu panel. Editor pages run the form (form sections at 12px radius, 20px padding, 20px between fields) beside a sticky preview column holding the live phone plate and the printable plaque. The unsaved-changes bar floats at the bottom and slides in only while dirty. Safe-area insets are respected at the bottom of every fixed element.

## Elevation & Depth

A hybrid: plate fields and the rail are flat colour; cards sit on paper with a soft, sea-tinted two-layer shadow; transient surfaces lift higher.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(16 52 82 / 0.05), 0 8px 24px -12px rgb(16 52 82 / 0.18)`): list containers, contact actions, info cards, form sections.
- **Lift** (`box-shadow: 0 2px 4px rgb(16 52 82 / 0.06), 0 18px 40px -18px rgb(16 52 82 / 0.35)`): toasts, the save bar, the mobile menu panel, hovered building cards; anything floating over content.
- **Control inset** (`box-shadow: inset 0 1px 1px rgb(16 52 82 / 0.04)`): text inputs at rest.
- **Focus halo** (`box-shadow: 0 0 0 3px rgb(21 107 168 / 0.14)`): input focus; danger-tinted when invalid.

### Named Rules
**The Tinted Shadow Rule.** Shadows on paper are tinted with sea, never neutral grey or black. Use the two named elevations; do not invent a third.

## Shapes

Gently rounded, getting rounder as surfaces get larger and more touchable: 6px for small buttons and focus outlines; 8px for buttons, inputs, segmented controls and rail links; 12px for large buttons, form sections, error notices, toasts, the save bar; 16px for public cards, directory lists and contact actions; full circles for icon discs, badges, switches and status dots. The on-screen plate is full-bleed and square-edged. The printed plaque is rounded at 3.5% of its width with a white QR well, and its centre mark sits in a square window of whole modules. Borders are 1px hairlines; the only heavy line is the 6px stone bar.

## Components

### Buttons
Firm and quiet: semibold Source Sans, compact heights, a 1px press-down on active.
- **Shape:** 6px (sm, 32px tall), 8px (md, 40px tall), 12px (lg, 48px tall).
- **Primary:** Logo Sea fill, white text, a 1px sea-tinted ground shadow; hover to Bright Sea, press to Deep Sea. The single main action of a back-office view (Save).
- **Sea:** Deep Sea fill, white text, hover to Logo Sea; for actions on sea fields and the sign-in submit.
- **Secondary:** card fill, Strong Hairline border, sea text; hover border shifts toward sea at 35%.
- **Ghost:** sea text, sea tint at 6% on hover.
- **Danger:** card fill, danger text and 30% danger border; tints danger-bg on hover. Destructive actions are two-step inline (ConfirmButton): the first press arms a solid danger button plus Cancel, auto-disarming after 5s. No modal.
- **On sea:** white text, white/25 border, white/8 fill; for controls inside the plate, masthead and save bar (Translate, Discard).
- **Focus:** 2px Bright Sea outline, 2px offset; stone-soft inside `.on-sea`. Disabled at 45% opacity.

### Inputs / Fields
- **Style:** white fill, Strong Hairline border, 8px radius, 40px tall, control inset shadow; select uses a Slate chevron.
- **Label:** label size, semibold, ink/80, above the control, with an optional language tag (ΕΛ / EN) on a deep-paper chip.
- **Focus:** border to Bright Sea plus the 3px focus halo.
- **Error / Disabled:** danger border and danger-tinted halo, message below with an alert icon; disabled goes to paper fill and Slate text.
- **Bilingual field:** Greek and English inputs side by side from 768px, stacked below.

### Segmented control and switch
- **Segmented:** deep-paper track with Strong Hairline border and 8px radius; the active option is a card chip with sea text and a soft sea shadow. On sea, the track is white/6 with a white/15 border, the active option is white with deep-sea text, inactive options white/75.
- **Switch:** 40x24 pill; on is solid ok green, off is deep paper with a Strong Hairline border; the knob travels on the expo-out ease.

### Badges
22px pills in caption type, text-on-tint: neutral, ok (published, with a dot), warn, danger, sea (sea on sea/8), stone (stone-ink on stone/20).

### Cards / Containers
- **Corner Style:** 16px on public pages, 12px in the back office.
- **Background:** Card on Paper, Hairline border, Card shadow.
- **Internal Padding:** 16px mobile, 20px from 640px; rows divided by hairlines at 80%.

### Navigation
- **Masthead:** Deep Sea strip, 64px, university lockup with a white/20 hairline separator and the department and product name in label size (white/80 and white/75); a Translate control on the right.
- **Admin rail:** Deep Sea, 16rem; links are 40px, 8px radius, white/75 semibold control-size text with an 18px line icon; active is a white/9 fill with a stone-soft icon.
- **Directory row:** door code in the numeral-row style on the left (4.25rem column), headline and small sub-line in sans, a Strong Hairline chevron that turns sea and nudges right on hover.

### Contact action
The door page's reason to exist. A 68px tall, 16px radius link with a 40px icon disc: primary is Logo Sea with a Logo Stone disc carrying a deep-sea icon, a label over the lead-size number; secondary is a card with a deep-paper disc and sea text. Call leads when a phone exists, otherwise email.

### The Plate (signature)
Sea field, full-bleed, content in the 42rem column. Top row: the room numeral (display, stone-soft) with kind and building as right-aligned label-size meta in white/90. Then a 1px stone/80 hairline that draws in from the left (scaleX 0 to 1, 900ms expo-out, 120ms delay). Then the name (headline, white) and the title (lead, white/90). The field closes with a 6px Logo Stone bar. A compact variant (3rem numeral, 1.5rem name) serves list and preview contexts. The editor renders the same plate live beside the form. The home header and home building cards (a 4px stone bar at the foot) reuse the same grammar.

### Printed plaque
A canvas PNG: Logo Sea field rounded at 3.5%, Logo Stone bars top and bottom, the QR drawn module by module in Engraved Stone on a white rounded well with a two-module quiet zone (error correction H). At the centre, a square window of whole modules (odd count, about 26% of the side) is left empty and holds the ΤΠΤΕ mark, framed by a thin Logo Sea rule; the window is cut into the grid, not stuck on top of it. Below: the room numeral in white Garamond 500, the name in white Garamond 600 (wrapped to the plaque width), and a Source Sans 600 footer "Κτίριο N · Πανεπιστήμιο Αιγαίου" at white/78, set at print scale. The favicon remains the university seal; the plaque carries the department mark.

### Feedback
Toasts are Deep Sea with the Lift shadow, a stone-soft check or a coral alert icon, rising 6px over 520ms. Error notices are danger-bg panels with a 25% danger border and an inline retry. Skeletons shimmer from deep paper through a near-white highlight (#f8f8f5) and back. All motion collapses under reduced-motion.

## Do's and Don'ts

### Do:
- **Do** open every public page with the Plate: stone-soft numeral, stone hairline, white name, 6px stone bar.
- **Do** set room codes and phone numbers with lining tabular figures (`nums`), in EB Garamond for codes.
- **Do** use stone-soft for stone on sea (numerals, icons) and stone-ink for stone on paper.
- **Do** keep secondary text on sea at white/90, and on deep sea at white/75 or stronger.
- **Do** keep the one primary action per view: the sea button in the back office, the sea contact action on the door page.
- **Do** use the named Card and Lift shadows, sea-tinted.
- **Do** lay Greek and English fields side by side in editors.
- **Do** make destructive actions two-step and inline.

### Don't:
- **Don't** set buttons, inputs, labels or navigation in Garamond.
- **Don't** use oldstyle figures for any code or number, on screen or on the plaque.
- **Don't** use neutral grey or black shadows on paper, or add a third elevation.
- **Don't** fill content cards on paper with sea; sea fields are the plate, the headers, the rail and transient bars.
- **Don't** set Logo Stone or stone-soft as label- or body-size text; stone-soft passes only at display size on sea.
- **Don't** bring back the navy and gold palette or the gold-ringed seal on the plaque; the palette is the ΤΠΤΕ logo's.
- **Don't** add gradients, glows or decorative imagery to the plate; its ornament is the stone rule.
