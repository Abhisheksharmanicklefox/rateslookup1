const express = require('express');
const router = express.Router();

// OTP routes will be implemented here
// POST /api/v1/otp/send
// POST /api/v1/otp/verify

router.post('/send', (req, res) => {
  res.json({ message: 'OTP send endpoint - to be implemented' });
});

router.post('/verify', (req, res) => {
  res.json({ message: 'OTP verify endpoint - to be implemented' });
});

module.exports = router;