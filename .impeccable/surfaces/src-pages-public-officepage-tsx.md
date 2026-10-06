---
version: 1
slug: "src-pages-public-officepage-tsx"
primary_target: "src/pages/public/OfficePage.tsx"
related_targets: ["src/pages/public/BuildingPage.tsx","src/pages/public/HomePage.tsx","src/pages/admin"]
---

---
version: 1
slug: "src-pages-public-officepage-tsx"
primary_target: "src/pages/public/OfficePage.tsx"
related_targets: ["src/pages/public/BuildingPage.tsx","src/pages/public/HomePage.tsx","src/pages/admin"]
---

# Surface brief: public door pages + back office

Scope: `/o/:slug`, `/b/:slug`, `/` (Read/Operate hybrid, mobile-first, corridor use) and `/admin/*`, `/login` (Operate).
Audience: students, visitors (EN), staff. Roles: admin edits everything; user is view-only (browse + download plaques).
Constraint: brief-pinned world. Palette pinned by the user on 2026-10-06 to the ΤΠΤΕ logo: sea blue #156BA8, grey #A2A39A, neutral paper; classical serif + Source Sans 3 kept. Display face is EB Garamond (real Greek glyphs).

## Direction contract

THESIS: The printed door plaque is the system. Every screen is a plate: sea-blue field, grey rule, the room number set large. Refuses the generic card-dashboard and the plain contact page.
OWN-WORLD: Logo sea-blue (#156BA8) fields bounded by 6px logo-grey (#A2A39A) bars; room numerals in EB Garamond lining figures, stone-soft (#DCDDD5) on blue and stone-ink (#5F6058) on paper; names in Garamond, everything operable in Source Sans 3; neutral paper #f4f4f0 with near-white cards and #e0e0d9 hairlines. Printed plaque: blue field, grey bars, deep-grey QR modules (#5F6058), the ΤΠΤΕ mark in a grid-aligned square window framed by a thin blue rule.
STORY: A visitor scans the door, sees immediately who is there and what they are, then taps call or email. Staff browse the same plates, download the printable PNG, and admins edit with a live plate preview.
FIRST VIEWPORT: (mobile door page) University lockup strip with a Translate control; sea-blue plate with the code "1.1.1" at about 76px in stone-soft Garamond, kind and building at top right; grey hairline; the occupant at 34px in white Garamond with the title below; grey bar; then a full-width sea-blue Call button with a grey disc icon.
FORM: Inherited, brief-pinned world (no concept roll: the user pinned the existing character). Signature interaction: the rule engraves in (scaleX, expo-out) under each plate on first paint; editor shows a live plate preview and warns when a code change would break printed QRs. Seed key: n/a (pinned).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
