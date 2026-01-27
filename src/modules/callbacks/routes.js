const express = require('express');
const router = express.Router();

// Callback routes will be implemented here
// POST /api/v1/callbacks
// GET /api/v1/callbacks
// PATCH /api/v1/callbacks/:id

router.post('/', (req, res) => {
  res.json({ message: 'Create callback request endpoint - to be implemented' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Get callback requests endpoint - to be implemented' });
});

module.exports = router;