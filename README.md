# Ψηφιακή Σήμανση ΤΠΤΕ · Πανεπιστήμιο Αιγαίου

Μόνιμα QR στις πόρτες γραφείων και εργαστηρίων. Το QR περιέχει μόνο ένα URL (π.χ. `/o/1.1.1`). Όνομα, ιδιότητα ή τηλέφωνο αλλάζουν από τη διαχείριση **χωρίς νέα εκτύπωση**.

## Stack

| Επίπεδο | Τεχνολογία |
| --- | --- |
| Frontend | Vite 6 · React 19 · TypeScript · Tailwind CSS 4 · React Router 7 |
| Backend | PHP 8 (χωρίς framework): PDO, sessions, CSRF |
| Βάση | MySQL / MariaDB (XAMPP) |

## Ρόλοι

| Ρόλος | Τι κάνει |
| --- | --- |
| **Επισκέπτης** (χωρίς σύνδεση) | Βλέπει τις δημοσιευμένες σελίδες `/`, `/o/…`, `/b/…` |
| **user** · Χρήστης προβολής | Μπαίνει στο `/admin`: επισκόπηση, πινακίδες QR, λήψη PNG. Δεν αλλάζει τίποτα. |
| **admin** · Διαχειριστής | Τα παραπάνω, και επεξεργασία χώρων και κτιρίων, και διαχείριση χρηστών |

Οι κανόνες ελέγχονται **στον server** (`require_role()` σε κάθε endpoint). Το UI απλώς κρύβει ό,τι δεν επιτρέπεται. Δεν μπορείτε να αφαιρέσετε τον ρόλο admin από τον εαυτό σας, και το σύστημα δεν μένει ποτέ χωρίς ενεργό διαχειριστή.

## Τοπικά (XAMPP)

1. Ξεκινήστε το **MySQL** από το XAMPP Control Panel.
2. Ρυθμίσεις και βάση:
   ```bash
   npm install
   cp backend/.env.example backend/.env     # βάλτε ADMIN_PASSWORD (≥ 8 χαρακτήρες)
   npm run db:setup                          # δημιουργεί DB, πίνακες, seed από data/*.json, admin
   php backend/db/setup.php --demo-user      # (προαιρετικό) user@aegean.gr / user12345
   ```
3. Εκκίνηση (PHP στο :8000 και Vite στο :4731 μαζί):
   ```bash
   npm run dev
   ```
   Ανοίξτε `http://localhost:4731`. Η διαχείριση είναι στο `/admin`.

Το `setup.php` μπορεί να ξανατρέξει με ασφάλεια: φορτώνει δεδομένα μόνο σε άδειους πίνακες.

## Διαδρομές

| Διαδρομή | Περιγραφή |
| --- | --- |
| `/` | Δημόσιος κατάλογος με αναζήτηση |
| `/o/1.1.1` | Σελίδα πόρτας (αυτό ανοίγει το QR) |
| `/b/1` | Σελίδα κτιρίου με τους χώρους του |
| `/login` | Είσοδος προσωπικού |
| `/admin` | Επισκόπηση: τι χρειάζεται προσοχή, πρόσφατες αλλαγές |
| `/admin/plaques` | Πινακίδες QR και λήψη PNG (όλοι οι ρόλοι) |
| `/admin/spaces`, `/admin/buildings`, `/admin/users` | Μόνο admin |

### API (`backend/api/`)

| Endpoint | Πρόσβαση |
| --- | --- |
| `public/directory.php`, `public/office.php?slug=`, `public/building.php?slug=` | δημόσιο (μόνο δημοσιευμένα) |
| `auth/me.php`, `auth/login.php`, `auth/logout.php`, `auth/password.php` | session |
| `offices.php`, `buildings.php` | GET: admin, user · POST/PUT/DELETE: admin |
| `users.php` | admin |
| `activity.php` | admin, user |

## Deploy σε Apache / XAMPP

```bash
npm run build
```

Αντιγράψτε στο document root (π.χ. `C:\xampp\htdocs\signage\`):

```
dist/*            → signage/            (index.html, assets/, .htaccess)
backend/api       → signage/api
backend/lib       → signage/lib         (έχει .htaccess: Require all denied)
backend/db        → signage/db          (έχει .htaccess: Require all denied)
backend/.env      → signage/.env
data/             → data/               (μόνο για το αρχικό setup)
```

Σε υποφάκελο, χτίστε με `VITE_BASE=/signage/ npm run build`. Σε production βάλτε HTTPS: το session cookie γίνεται αυτόματα `Secure`.

**Πριν τυπώσετε QR:** ανοίξτε τη διαχείριση από το τελικό domain. Τα QR χρησιμοποιούν το origin του browser.
