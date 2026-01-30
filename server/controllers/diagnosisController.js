const db = require('../db'); // your MySQL pool connection

exports.createDiagnosisWithPatientData = (req, res) => {
  const {
    patient_id,
    temperature_value,
    temperature_unit,
    height_value,
    height_unit,
    weight_value,
    weight_unit,
    spo2_percentage,
    systolic_pressure,
    diastolic_pressure,
    pulse_rate
  } = req.body;

  // Step 1: Get patient name and age
  db.execute(
    'SELECT name, TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age FROM patient WHERE id = ?',
    [patient_id],
    (err, patientRows) => {
      if (err) {
        console.error('Error fetching patient:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (patientRows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const { name, age } = patientRows[0];

      // Step 2: Insert into diagnosis table
      // Step 2: Insert into diagnosis table
db.execute(
  `INSERT INTO diagnosis (
    patient_id, name, age,
    temperature_value, temperature_unit,
    height_value, height_unit,
    weight_value, weight_unit,
    spo2_percentage, systolic_pressure,
    diastolic_pressure, pulse_rate,
    diagnosis_status  -- ✅ NEW
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    patient_id, name, age,
    temperature_value, temperature_unit || 'C',
    height_value, height_unit || 'cm',
    weight_value, weight_unit || 'kg',
    spo2_percentage, systolic_pressure,
    diastolic_pressure, pulse_rate,
    'pending' // ✅ New status
  ],

        (insertErr, result) => {
          if (insertErr) {
            console.error('Error inserting diagnosis:', insertErr);
            return res.status(500).json({ error: 'Failed to save diagnosis', details: insertErr.message });
          }

          res.status(201).json({
            message: 'Diagnosis record saved successfully',
            diagnosis_id: result.insertId
          });
        }
      );
    }
  );
};


exports.getDiagnosisByPatientId = (req, res) => {
  const patientId = req.params.patient_id;

  const sql = `
    SELECT 
      d.diagnosis_id,
      d.diagnosis_date,
      p.name,
      p.age,
      d.temperature_value,
      d.temperature_unit,
      d.height_value,
      d.height_unit,
      d.weight_value,
      d.weight_unit,
      d.spo2_percentage,
      d.systolic_pressure,
      d.diastolic_pressure,
      d.pulse_rate,
      r.prescription,
      r.doctor_notes
    FROM diagnosis d
    LEFT JOIN (
      SELECT r1.*
      FROM records r1
      INNER JOIN (
        SELECT diagnosis_id, MAX(created_at) AS latest_record
        FROM records
        GROUP BY diagnosis_id
      ) r2 ON r1.diagnosis_id = r2.diagnosis_id AND r1.created_at = r2.latest_record
    ) r ON d.diagnosis_id = r.diagnosis_id
    JOIN patient p ON d.patient_id = p.id
    WHERE d.patient_id = ?
    ORDER BY d.diagnosis_date DESC
  `;

  db.execute(sql, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching diagnosis:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No diagnosis records found for this patient' });
    }

    res.status(200).json(results);
  });
};

exports.getPendingDiagnosis = (req, res) => {
  const query = `
    SELECT 
      d.diagnosis_id,
      d.patient_id,
      p.name,
      p.age,
      d.temperature_value,
      d.temperature_unit,
      d.height_value,
      d.height_unit,
      d.weight_value,
      d.weight_unit,
      d.systolic_pressure,
      d.diastolic_pressure,
      d.spo2_percentage,
      d.pulse_rate,
      d.diagnosis_date
    FROM diagnosis d
    JOIN patient p ON d.patient_id = p.id
    LEFT JOIN records r ON r.diagnosis_id = d.diagnosis_id
    WHERE r.diagnosis_id IS NULL AND d.diagnosis_status = 'pending'
    ORDER BY d.diagnosis_id DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};


exports.skipDiagnosis = (req, res) => {
  const id = req.params.id;
  db.query(
    'UPDATE diagnosis SET diagnosis_status = "skipped" WHERE diagnosis_id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Diagnosis skipped" });
    }
  );
};

exports.getDiagnosisByDate = (req, res) => {
  const selectedDate = req.query.date; // Expected format: YYYY-MM-DD

  const sql = `
    SELECT 
      d.diagnosis_id,
      d.diagnosis_date,
      p.name,
      p.age
    FROM diagnosis d
    JOIN patient p ON d.patient_id = p.id
    WHERE DATE(d.diagnosis_date) = ?
    ORDER BY d.diagnosis_date DESC
  `;

  db.execute(sql, [selectedDate], (err, results) => {
    if (err) {
      console.error('Error fetching diagnosis by date:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.status(200).json(results);
  });
};

// ✅ NEW: Get all cases created today

exports.getPendingCount = (req, res) => {
  const query = `
    SELECT COUNT(*) AS pending_count 
    FROM diagnosis 
    WHERE diagnosis_status = 'pending'
  `;
  db.query(query, (err, rows) => {
    if (err) throw err;
    res.json(rows[0]);
  });
};

exports.getTodayCount = (req, res) => {
  const query = `
    SELECT COUNT(*) AS today_count 
    FROM diagnosis 
    WHERE DATE(diagnosis_date) = CURDATE();
  `;
  db.query(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error getting today count');
    }
    res.json(rows[0]);
  });
};


