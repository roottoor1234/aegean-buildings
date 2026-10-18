-- Αγγλικές ετικέτες για χώρους χωρίς ονοματεπώνυμο + CT&C → CTC.
-- phpMyAdmin → επιλέγεις τη βάση → καρτέλα SQL → επικόλληση → Εκτέλεση.
-- Ασφαλές να ξανατρέξει.

-- ─── CT&C → CTC (αν έχουν μείνει) ───────────────────────────────────────────
UPDATE buildings SET
  name_en  = REPLACE(name_en,  'CT&C', 'CTC'),
  notes_en = REPLACE(notes_en, 'CT&C', 'CTC');

UPDATE offices SET
  title_en = REPLACE(title_en, 'CT&C', 'CTC');

-- ─── Πλήρες όνομα τμήματος στα Αγγλικά ──────────────────────────────────────
UPDATE offices SET
  department_en = 'Department of Cultural Technology and Communication'
WHERE department_en = ''
   OR department_en LIKE 'Department of Cultural Technology and Communi%';

-- ─── Ετικέτες EN ────────────────────────────────────────────────────────────
UPDATE offices SET label_en = 'Videoconference Room'
WHERE code = '1.1.19';

UPDATE offices SET label_en = 'Contract staff office'
WHERE code = '1.1.22';

UPDATE offices SET label_en = 'Research Laboratory - Privacy Protection Technologies & ICT Applications in the Social Sciences'
WHERE code = '2.2.1';

UPDATE offices SET label_en = 'Laboratory of Cultural Information Systems'
WHERE code = '2.2.2';

UPDATE offices SET label_en = 'Laboratory of Cultural Heritage Management'
WHERE code = '2.2.3';

UPDATE offices SET label_en = 'Intelligent Systems Laboratory'
WHERE code IN ('2.2.14', '2.2.15');

UPDATE offices SET label_en = 'Museology Laboratory'
WHERE code = '2.2.17';

UPDATE offices SET label_en = 'Undergraduate Computer Laboratory'
WHERE code = '2.3.1';

UPDATE offices SET label_en = 'Postgraduate Computer Laboratory'
WHERE code = '2.3.2';
