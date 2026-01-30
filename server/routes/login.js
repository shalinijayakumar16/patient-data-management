const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login', loginController.login);

router.post('/logout', loginController.logout);

module.exports = router;
