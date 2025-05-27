
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { passwordResetValidation } = require('../middleware/validate');

// Route for requesting password reset (accepts email and client-generated code)
router.post('/forgot', passwordController.forgotPassword);

// Route for resetting password (email + code + new password)
router.post('/reset', passwordResetValidation, passwordController.resetPassword);

module.exports = router;
