const express = require('express');
const { getStats, getTransactions } = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin role check to all routes below
router.use(verifyToken);
router.use(checkRole(['admin']));

router.get('/stats', getStats);
router.get('/transactions', getTransactions);

module.exports = router;
