# Ψηφιακή Σήμανση ΤΠΤΕ — Πανεπιστήμιο Αιγαίου

QR σε πόρτες γραφείων / εργαστηρίων που ανοίγουν **μόνιμη ιστοσελίδα** στο κινητό.

Το QR περιέχει μόνο το URL (π.χ. `/o/1.1.1`). Αλλάζεις όνομα ή τηλέφωνο από το admin **χωρίς νέα εκτύπωση**.

## Ροή

**Σάρωση QR → σελίδα γραφείου → πληροφορίες**

- Γλώσσα από το browser (EL / EN από τα δεδομένα)
- Προαιρετικά: κουμπί **Μετάφραση** (Google) μόνο στις δημόσιες σελίδες QR

Παράδειγμα: `https://yourdomain.com/o/1.1.1`

## Stack

- Next.js 15 + React 19 + Tailwind CSS 4
- Supabase (Postgres) για live δεδομένα
- Branded QR plaques (λήψη PNG)

## Τρέξιμο τοπικά

```bash
npm install
cp .env.example .env.local
# συμπλήρωσε NEXT_PUBLIC_SUPABASE_URL και NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Η εφαρμογή ακούει στο `http://localhost:4731`.

| Διαδρομή | Ρόλος |
| --- | --- |
| `/` | Κατάλογος χώρων + λήψη branded QR |
| `/o/1.1.1` | Δημόσια σελίδα γραφείου / εργαστηρίου |
| `/b/1` | Σελίδα κτιρίου με λίστα χώρων |
| `/admin` | CMS επεξεργασίας |
| `/api/offices` | GET/PUT χώρων |
| `/api/buildings` | GET/PUT κτιρίων |

## Βάση (Supabase) — μία φορά

1. Άνοιξε το [SQL Editor](https://supabase.com/dashboard) του project σου
2. Τρέξε το [`supabase/schema.sql`](supabase/schema.sql)
3. Seed από τα τοπικά JSON:

```bash
npm run seed
```

Μετά το seed, το `/admin` αποθηκεύει live στη βάση.

Τα αρχεία `data/offices.json` και `data/buildings.json` μένουν ως backup / αρχικό seed.

## Environment variables

Δες [`.env.example`](.env.example):

| Variable | Περιγραφή |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key |
| `NEXT_PUBLIC_SITE_URL` | (προαιρετικό) δημόσιο domain για QR σε production |

**Μην** κάνεις commit το `.env.local`.

## Deploy (Vercel)

1. Import το repo στο Vercel
2. Βάλε τα ίδια env vars
3. Deploy
4. Εκτύπωσε QR με το production URL, π.χ. `https://your-app.vercel.app/o/1.1.1`

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # production server
npm run seed     # seed Supabase από data/*.json
npm run lint     # eslint
```

## Σημειώσεις

- Τα δημόσια URL βασίζονται στον **κωδικό χώρου** (`/o/1.1.1`), όχι σε random id. Τα παλιά `/o/<id>` κάνουν redirect.
- Το Google Translate εμφανίζεται μόνο στις σελίδες `/o/...` και `/b/...`.
