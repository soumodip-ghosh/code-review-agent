const express = require('express');
const router = express.Router();
const { optimizeCode, optimizeRepo } = require('../controllers/optimizeController');

router.post('/optimize-code', optimizeCode);
router.post('/optimize-repo', optimizeRepo);

module.exports = router;
