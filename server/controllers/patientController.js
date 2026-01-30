const db = require('../db');

// Get all patients
exports.getAllPatients = (req, res) => {
  const sql = 'SELECT * FROM patient';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching patients:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Format dob to remove time (keep only YYYY-MM-DD)
    const formattedResults = results.map(patient => ({
      ...patient,
      dob: patient.dob ? patient.dob.toISOString().split('T')[0] : null
    }));

    res.json(formattedResults);
  });
};


// Get patient by ID
exports.getPatientById = (req, res) => {
  const sql = 'SELECT * FROM patient WHERE id = ?';

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Patient not found' });

    const patient = result[0];

    // ✅ Convert dob to 'YYYY-MM-DD'
    if (patient.dob instanceof Date) {
      patient.dob = patient.dob.toISOString().split('T')[0];
    }

    res.json(patient);
  });
};


// CRETA NEW PATIENT AND VISIT

exports.register_Patient = (req, res) => {
  const {
    name,
    age,
    dob,
    address,
    phone_number,
    email,
    gender,
    purpose_of_visit
  } = req.body;

  const insertPatientQuery = `
    INSERT INTO patient (name, age, dob, address, phone_number, email, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertPatientQuery, [name, age, dob, address, phone_number, email, gender], (err, result) => {
    if (err) {
      console.error("❌ Error inserting patient:", err);
      return res.status(500).json({ error: "Patient registration failed" });
    }

    const patientId = result.insertId;

    const insertVisitQuery = `
      INSERT INTO visits (patient_id, purpose_of_visit,status)
      VALUES (?, ?, 'waiting')
    `;

    db.query(insertVisitQuery, [patientId, purpose_of_visit], (err2) => {
      if (err2) {
        console.error("❌ Error inserting visit:", err2);
        return res.status(500).json({ error: "Visit creation failed" });
      }

      res.status(200).json({ message: "✅ Patient and visit registered successfully" });
    });
  });
};


//DELETE
exports.deletePatient = (req, res) => {
  const patientId = req.params.id;

  // Step 1: Get all diagnosis_ids for this patient
  const getDiagnosisIds = 'SELECT diagnosis_id FROM diagnosis WHERE patient_id = ?';
  db.query(getDiagnosisIds, [patientId], (err1, diagnosisResults) => {
    if (err1) return res.status(500).json({ error: 'Failed to fetch diagnosis IDs', details: err1 });

    const diagnosisIds = diagnosisResults.map(d => d.diagnosis_id);
    if (diagnosisIds.length === 0) return proceedToDeleteDiagnosisAndBelow();

    // Step 2: Delete from records where diagnosis_id in [...]
    const deleteRecords = 'DELETE FROM records WHERE diagnosis_id IN (?)';
    db.query(deleteRecords, [diagnosisIds], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to delete records', details: err2 });

      // Step 3: Continue with rest of deletion
      proceedToDeleteDiagnosisAndBelow();
    });

    // Helper function to continue deletion
    function proceedToDeleteDiagnosisAndBelow() {
      // Step 4: Delete diagnosis entries for this patient
      const deleteDiagnosis = 'DELETE FROM diagnosis WHERE patient_id = ?';
      db.query(deleteDiagnosis, [patientId], (err3) => {
        if (err3) return res.status(500).json({ error: 'Failed to delete diagnosis', details: err3 });

        // Step 5: Delete visits
        const deleteVisits = 'DELETE FROM visits WHERE patient_id = ?';
        db.query(deleteVisits, [patientId], (err4) => {
          if (err4) return res.status(500).json({ error: 'Failed to delete visits', details: err4 });

          // Step 6: Delete the patient
          const deletePatient = 'DELETE FROM patient WHERE id = ?';
          db.query(deletePatient, [patientId], (err5, result) => {
            if (err5) return res.status(500).json({ error: 'Failed to delete patient', details: err5 });

            if (result.affectedRows === 0) {
              return res.status(404).json({ message: 'Patient not found' });
            }

            res.json({ message: '✅ Patient and all related records deleted successfully' });
          });
        });
      });
    }
  });
};

//patch
exports.updatePatientPartial = (req, res) => {
  const updates = req.body;
  const patientId = req.params.id;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No data provided for update' });
  }

  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);

  const sql = `UPDATE patient SET ${fields} WHERE id = ?`;

  db.query(sql, [...values, patientId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient updated successfully' });
  });
};
//nurse dashboard 
exports.searchPatientsByNameOrId = (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const isId = /^\d+$/.test(query);
  const sql = isId
    ? 'SELECT * FROM patient WHERE id = ?'
    : 'SELECT * FROM patient WHERE name LIKE ?';
  const param = isId ? query : `%${query}%`;

  db.query(sql, [param], (err, results) => {
    if (err) {
      console.error('Error searching patients:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }

    // Format DOB
    results.forEach(p => {
      if (p.dob instanceof Date) {
        p.dob = p.dob.toISOString().split('T')[0];
      }
    });

    res.json(results);
  });
};

exports.getPatientByIdOrName = (req, res) => {
  const identifier = req.params.identifier;

  const isId = /^\d+$/.test(identifier);
  const query = isId
    ? 'SELECT * FROM patient WHERE id = ?'
    : 'SELECT * FROM patient WHERE name LIKE ?';
  const param = isId ? identifier : `%${identifier}%`;

  db.query(query, [param], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Patient not found' });

    const formatDOB = (p) => {
      if (p.dob instanceof Date) {
        p.dob = p.dob.toISOString().split('T')[0];
      }
      return p;
    };

    if (isId) {
      res.json(formatDOB(results[0]));
    } else {
      res.json(results.map(formatDOB));
    }
  });
};
//nurse dashboard - get basic patient info by ID or name
exports.getBasicPatientInfoByIdOrName = (req, res) => {
  const identifier = req.params.identifier;
  const isId = /^\d+$/.test(identifier); // Check if it's a number

  const query = isId
    ? 'SELECT id, name, TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age FROM patient WHERE id = ?'
    : 'SELECT id, name, TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age FROM patient WHERE name LIKE ?';

  const param = isId ? identifier : `%${identifier}%`;

  db.query(query, [param], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Patient not found' });

    res.json(isId ? results[0] : results); // If ID, return object. If name, return array
  });
};





exports.filterPatients = (req, res) => {
  const { id, name, dob } = req.query;

  let query = `
    SELECT id, name, dob, TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age
    FROM patient
    WHERE 1 = 1
  `;
  const params = [];

  if (id && id.trim() !== "") {
    query += " AND id LIKE ?";
    params.push(`%${id.trim()}%`);
  }

  if (name && name.trim() !== "") {
    query += " AND LOWER(name) LIKE ?";
params.push(`${name.trim().toLowerCase()}%`);

}



  if (dob && dob.trim() !== "") {
    query += " AND dob = ?";
    params.push(dob.trim());
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error filtering patients:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
