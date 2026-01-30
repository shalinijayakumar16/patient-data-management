const db = require('../db'); // Your MySQL connection

// ✅ Get the next patient in the doctor's queue
exports.getNextPatientQueue = (req, res) => {
  const sql = `
    SELECT 
      d.diagnosis_id, d.patient_id, 
      p.name, p.age,
      d.temperature_value, d.temperature_unit,
      d.height_value, d.height_unit,
      d.weight_value, d.weight_unit,
      d.spo2_percentage, d.systolic_pressure, d.diastolic_pressure,
      d.pulse_rate, d.diagnosis_date
    FROM diagnosis d
    JOIN patient p ON p.id = d.patient_id
    LEFT JOIN records r ON d.diagnosis_id = r.diagnosis_id
    WHERE r.diagnosis_id IS NULL
    ORDER BY d.diagnosis_date ASC
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching doctor queue:", err);
      return res.status(500).json({ error: "Failed to fetch doctor queue" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No patients in queue" });
    }

    res.json(result[0]); // Send next patient + vitals
  });
};



// ✅ Save doctor prescription and notes
exports.submitRecord = (req, res) => {
  const { patient_id, diagnosis_id, prescription, doctor_notes } = req.body;

  if (!patient_id || !diagnosis_id || !prescription || !doctor_notes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO records (patient_id, diagnosis_id, prescription, doctor_notes)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [patient_id, diagnosis_id, prescription, doctor_notes], (err, result) => {
    if (err) {
      console.error("❌ Failed to save doctor record:", err);
      return res.status(500).json({ error: "Failed to save record" });
    }

    res.status(201).json({
      message: "✅ Record saved",
      diagnosis_id
    });
  });
};

exports.createRecord = (req, res) => {
  const { diagnosis_id, prescription, doctor_notes, doctor_id } = req.body;
  const query = `
    INSERT INTO records (diagnosis_id, prescription, doctor_notes, doctor_id)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [diagnosis_id, prescription, doctor_notes, doctor_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Record saved' });
  });
};
