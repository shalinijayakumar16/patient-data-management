const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// Route to add a new visit
router.post('/', visitController.addVisit);

// Route to get all visits for a patient
router.get('/:patient_id', visitController.getVisitsByPatientId);
//add existing patient visit
router.post('/', visitController.addVisitForExistingPatient);

// Route to delete a visit
router.delete('/:visit_id', visitController.deleteVisit);

module.exports = router;
