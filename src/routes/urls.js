const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl,
  getAllUrls,
  deleteUrl,
} = require('../controllers/controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateUrl = require('../middleware/validateUrl');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, validateUrl, shortenUrl);
router.get('/', authMiddleware, getAllUrls);
router.delete('/:shortCode', authMiddleware, deleteUrl);

// Redirect route — this goes on the main app, not /api/urls
// We'll export and register it separately
router.get('/redirect/:shortCode', redirectUrl);

module.exports = { router, redirectUrl };