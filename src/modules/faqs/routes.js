const express = require('express');
const router = express.Router();

// FAQ routes will be implemented here
// GET /api/v1/faqs
// GET /api/v1/faqs/categories

router.get('/', (req, res) => {
  res.json({ message: 'Get FAQs endpoint - to be implemented' });
});

router.get('/categories', (req, res) => {
  res.json({ message: 'Get FAQ categories endpoint - to be implemented' });
});

module.exports = router;