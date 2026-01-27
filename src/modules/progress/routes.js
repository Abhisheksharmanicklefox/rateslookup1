const express = require('express');
const router = express.Router();

// Progress routes will be implemented here
// GET /api/v1/progress/:applicationId
// POST /api/v1/progress/:applicationId/:step
// PATCH /api/v1/progress/:applicationId/:step

router.get('/:applicationId', (req, res) => {
  res.json({ message: 'Get progress endpoint - to be implemented' });
});

router.post('/:applicationId/:step', (req, res) => {
  res.json({ message: 'Save progress endpoint - to be implemented' });
});

module.exports = router;