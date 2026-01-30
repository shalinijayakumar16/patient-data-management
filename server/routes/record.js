const express = require('express');
const router = express.Router();

const recordController = require('../controllers/recordController');

// Doctor: Get next patient in queue
router.get('/queue', recordController.getNextPatientQueue);

// Doctor: Submit prescription + notes
router.post('/submit', recordController.submitRecord);

router.post('/', recordController.createRecord);

module.exports = router;
