const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');

router.get('/filter-by-date', diagnosisController.getDiagnosisByDate);

// 🔍 Get all diagnosis records for a patient (with latest prescription/notes)
router.get('/patient/:patient_id', diagnosisController.getDiagnosisByPatientId);

// Other routes
router.post('/', diagnosisController.createDiagnosisWithPatientData);
router.get('/pending', diagnosisController.getPendingDiagnosis);
router.patch('/skip/:id', diagnosisController.skipDiagnosis);

// 👉 Pending Cases count
router.get('/pending-count', diagnosisController.getPendingCount);

// 👉 Today’s Cases count
router.get('/today-count', diagnosisController.getTodayCount);
// ✅ New today's cases endpoint


module.exports = router;
