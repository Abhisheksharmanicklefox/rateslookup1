const express = require('express');
const router = express.Router();

// Tools routes will be implemented here
// GET /api/v1/tools
// GET /api/v1/tools/:id
// POST /api/v1/tools/:id/run

router.get('/', (req, res) => {
  res.json({ message: 'Get tools endpoint - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get tool by ID endpoint - to be implemented' });
});

router.post('/:id/run', (req, res) => {
  res.json({ message: 'Run tool endpoint - to be implemented' });
});

module.exports = router;