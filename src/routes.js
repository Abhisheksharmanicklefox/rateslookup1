const express = require('express');

// Import module routes
const applicationsRoutes = require('./modules/applications/routes');
const progressRoutes = require('./modules/progress/routes');
const otpRoutes = require('./modules/otp/routes');
const ratesRoutes = require('./modules/rates/routes');
const callbacksRoutes = require('./modules/callbacks/routes');
const leadsRoutes = require('./modules/leads/routes');
const exploreRatesRoutes = require('./modules/explore-rates/routes');
const toolsRoutes = require('./modules/tools/routes');
const analyticsRoutes = require('./modules/analytics/routes');
const faqsRoutes = require('./modules/faqs/routes');
const testimonialsRoutes = require('./modules/testimonials/routes');
const mythsRoutes = require('./modules/myths/routes');

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register module routes
router.use(`${API_VERSION}/applications`, applicationsRoutes);
router.use(`${API_VERSION}/progress`, progressRoutes);
router.use(`${API_VERSION}/otp`, otpRoutes);
router.use(`${API_VERSION}/rates`, ratesRoutes);
router.use(`${API_VERSION}/callbacks`, callbacksRoutes);
router.use(`${API_VERSION}/leads`, leadsRoutes);
router.use(`${API_VERSION}/explore-rates`, exploreRatesRoutes);
router.use(`${API_VERSION}/tools`, toolsRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/faqs`, faqsRoutes);
router.use(`${API_VERSION}/testimonials`, testimonialsRoutes);
router.use(`${API_VERSION}/myths`, mythsRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'RatesLookup API Documentation',
    version: '1.0.0',
    endpoints: {
      applications: {
        base: `${API_VERSION}/applications`,
        description: 'Mortgage application management',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
      },
      progress: {
        base: `${API_VERSION}/progress`,
        description: 'Application progress tracking',
        methods: ['GET', 'POST', 'PATCH']
      },
      otp: {
        base: `${API_VERSION}/otp`,
        description: 'OTP verification system',
        methods: ['POST']
      },
      rates: {
        base: `${API_VERSION}/rates`,
        description: 'Rate offers and calculations',
        methods: ['GET', 'POST']
      },
      callbacks: {
        base: `${API_VERSION}/callbacks`,
        description: 'Callback request management',
        methods: ['GET', 'POST', 'PATCH']
      },
      leads: {
        base: `${API_VERSION}/leads`,
        description: 'Lead capture and management',
        methods: ['GET', 'POST']
      },
      exploreRates: {
        base: `${API_VERSION}/explore-rates`,
        description: 'Rate exploration tools',
        methods: ['GET', 'POST']
      },
      tools: {
        base: `${API_VERSION}/tools`,
        description: 'Dynamic calculation tools',
        methods: ['GET', 'POST']
      },
      analytics: {
        base: `${API_VERSION}/analytics`,
        description: 'Analytics and reporting',
        methods: ['GET']
      },
      faqs: {
        base: `${API_VERSION}/faqs`,
        description: 'Frequently asked questions',
        methods: ['GET']
      },
      testimonials: {
        base: `${API_VERSION}/testimonials`,
        description: 'Customer testimonials',
        methods: ['GET']
      },
      myths: {
        base: `${API_VERSION}/myths`,
        description: 'Myth vs fact content',
        methods: ['GET']
      }
    }
  });
});

module.exports = router;