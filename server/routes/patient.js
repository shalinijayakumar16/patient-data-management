const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// ✅ Specific/static routes first
router.get('/filter', patientController.filterPatients);
router.get('/search', patientController.searchPatientsByNameOrId);
router.get('/basic-info/:identifier', patientController.getBasicPatientInfoByIdOrName);
router.get('/', patientController.getAllPatients);

// ✅ Dynamic routes after
router.get('/:identifier', patientController.getPatientByIdOrName);
router.post('/register', patientController.register_Patient);
router.delete('/:id', patientController.deletePatient);
router.patch('/:id', patientController.updatePatientPartial);

module.exports = router;
