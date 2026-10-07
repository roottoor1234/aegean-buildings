-- CT&C → CTC σε όλα τα αποθηκευμένα κείμενα (κτίρια, χώροι).
-- Τρέξτε το στο phpMyAdmin με επιλεγμένη τη βάση. Ασφαλές να ξανατρέξει.

UPDATE buildings SET
  name_el        = REPLACE(name_el,        'CT&C', 'CTC'),
  name_en        = REPLACE(name_en,        'CT&C', 'CTC'),
  school_en      = REPLACE(school_en,      'CT&C', 'CTC'),
  address_en     = REPLACE(address_en,     'CT&C', 'CTC'),
  notes_el       = REPLACE(notes_el,       'CT&C', 'CTC'),
  notes_en       = REPLACE(notes_en,       'CT&C', 'CTC'),
  departments_en = REPLACE(departments_en, 'CT&C', 'CTC');

UPDATE offices SET
  label_en      = REPLACE(label_en,      'CT&C', 'CTC'),
  occupant_en   = REPLACE(occupant_en,   'CT&C', 'CTC'),
  title_el      = REPLACE(title_el,      'CT&C', 'CTC'),
  title_en      = REPLACE(title_en,      'CT&C', 'CTC'),
  department_en = REPLACE(department_en, 'CT&C', 'CTC'),
  notes_el      = REPLACE(notes_el,      'CT&C', 'CTC'),
  notes_en      = REPLACE(notes_en,      'CT&C', 'CTC');
