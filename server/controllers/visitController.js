const db = require('../db');

// Add a visit for a patient
exports.addVisit = (req, res) => {
  const { patient_id, purpose_of_visit } = req.body;

  const query = `
    INSERT INTO visits (patient_id, purpose_of_visit)
    VALUES (?, ?)
  `;

  db.query(query, [patient_id, purpose_of_visit], (err, result) => {
    if (err) {
      console.error('Error adding visit:', err);
      return res.status(500).json({ error: 'Failed to add visit' });
    }
    res.status(201).json({ message: 'Visit recorded successfully', visit_id: result.insertId });
  });
};

// Get all visits of a patient by ID
exports.getVisitsByPatientId = (req, res) => {
  const patientId = req.params.patient_id;

  const query = `
    SELECT p.name, p.age, p.dob, p.phone_number, v.purpose_of_visit, v.visit_datetime
    FROM visits v
    JOIN patient p ON p.id = v.patient_id
    WHERE v.patient_id = ?
    ORDER BY v.visit_datetime DESC
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching visits:', err);
      return res.status(500).json({ error: 'Failed to fetch visits' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No visits found for this patient' });
    }

    res.json(results);
  });
};

// DELETE a visit by visit_id
exports.deleteVisit = (req, res) => {
  const visitId = req.params.visit_id;

  const query = 'DELETE FROM visits WHERE visit_id = ?';
  db.query(query, [visitId], (err, result) => {
    if (err) {
      console.error('Error deleting visit:', err);
      return res.status(500).json({ error: 'Failed to delete visit' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  });
};



// POST /api/visits
exports.addVisitForExistingPatient = (req, res) => {
  const { patient_id, purpose_of_visit } = req.body;

  if (!patient_id || !purpose_of_visit) {
    return res.status(400).json({ error: "patient_id and purpose_of_visit are required" });
  }

  const checkPatientQuery = 'SELECT * FROM patient WHERE id = ?';
  db.query(checkPatientQuery, [patient_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const insertVisitQuery = 'INSERT INTO visits (patient_id, purpose_of_visit) VALUES (?, ?)';
    db.query(insertVisitQuery, [patient_id, purpose_of_visit], (err2, result2) => {
      if (err2) {
        return res.status(500).json({ error: 'Error inserting visit', details: err2 });
      }

      res.status(201).json({
        message: 'Visit recorded',
        patient_id,
        visit_id: result2.insertId
      });
    });
  });
};
