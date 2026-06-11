const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl,
  getAllUrls,
  deleteUrl,
} = require('../controllers/controller');
const validateUrl = require('../middleware/validateUrl');

router.post('/', validateUrl, shortenUrl);
router.get('/', getAllUrls);
router.delete('/:shortCode', deleteUrl);

// Redirect route — this goes on the main app, not /api/urls
// We'll export and register it separately
router.get('/redirect/:shortCode', redirectUrl);

module.exports = { router, redirectUrl };