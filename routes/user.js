const { config } = require('dotenv');
const password = require('../middleware/password-validator-config');
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', password, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router; 