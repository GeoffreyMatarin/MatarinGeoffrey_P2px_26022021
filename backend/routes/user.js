const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const verifyPassword = require('../middleware/verifypassword');

router.post('/signup', verifyPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;