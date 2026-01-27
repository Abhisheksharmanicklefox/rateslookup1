const express = require('express');
const router = express.Router();

// Myth vs Fact routes will be implemented here
// GET /api/v1/myths
// GET /api/v1/myths/:id

router.get('/', (req, res) => {
  res.json({ message: 'Get myths endpoint - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get myth by ID endpoint - to be implemented' });
});

module.exports = router;