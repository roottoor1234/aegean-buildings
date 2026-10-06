# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript frontend, plain PHP 8 API backend, MySQL (XAMPP locally). Stack pattern borrowed from the sibling `main-website` project (Vite proxy to `php -S` on :8000, `.env` loaded by `config.php`, PDO singleton, PHP sessions).

## Users

- **Students in the corridor**: scan the QR on an office/lab door with a phone, standing, to find who sits there, their title, and how to reach them.
- **Visitors / foreigners** (Erasmus, guests): same job, need English content or machine translation.
- **Staff** (secretariat, faculty): look up spaces and contact details.
- **Signed-in roles**:
  - `admin`: full CMS. Create/edit/delete offices and buildings, publish/unpublish, manage user accounts, download QR plaques.
  - `user`: view-only back office. Browse the QR catalog and download plaques; cannot edit anything.

## Product Purpose

Permanent QR door signage for the Department of Cultural Technology and Communication (ΤΠΤΕ), University of the Aegean, Mytilene. The QR encodes only a stable URL (`/o/1.1.1`, `/b/1`); names, titles, and phones change in the CMS without reprinting.

## Positioning

The printed plaque never changes; the page behind it always stays current.

## Operating Context

- Public pages are opened on phones, one-handed, in corridors, often on mobile data.
- Branded PNG plaques (navy, gold rules, university mark in the QR center) are generated client-side and printed.
- Content is bilingual EL/EN stored per record; browser language picks the locale; optional Google Translate for other languages on public pages only.

## Capabilities and Constraints

- Offices have kind `office | lab | room`, a room code like `1.1.1`, building code `1` or `2`, phone, email, and localized label/occupant/title/building/department/notes.
- Buildings: localized name/island/school/departments/address/notes, phone, email, website, lat/lng for map link.
- Public URLs must remain `/o/<code>` and `/b/<code>` (printed QRs depend on them).
- Unpublished records must not be visible publicly.

## Brand Commitments

University of the Aegean seal (`public/assets/logo-mark.png`) is the favicon; the white lockup `logo-aegean.png` sits on the dark mastheads. The ΤΠΤΕ department mark (`public/assets/logo-tpte.png`, supplied by the user) sits in the centre of every QR plaque.

Colour direction (user, 2026-10-06): the dominant colours come from the ΤΠΤΕ logo across the whole app: its sea blue (#156BA8) for fields and actions, its grey (#A2A39A) for rules, QR modules in a deepened shade of that grey. This replaces the earlier navy + gold. Character otherwise kept: classical Garamond for names and numerals, calm and academic.

## Evidence on Hand

Real seed data: `data/offices.json` (34 spaces), `data/buildings.json`, source document `data/source/Simansi_Grafeia_TPTE.docx`. No testimonials or metrics exist; do not invent them.

## Product Principles

1. The door page answers "who is here and how do I reach them" within one glance.
2. Permanence: URLs and plaques are contracts; never break them.
3. Bilingual by default, not as an afterthought.
4. Back office is a quiet tool; roles decide what is possible, not what is shown as disabled.

## Accessibility & Inclusion

Mobile-first public pages, large tap targets for tel:/mailto:, sufficient contrast on navy/gold, works for non-Greek speakers.
