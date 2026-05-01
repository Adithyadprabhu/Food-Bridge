const express = require('express');
const { createRequest, getRequests, updateRequest } = require('../controllers/requestController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole(['ngo', 'admin']), createRequest);
router.get('/', verifyToken, getRequests);
router.put('/:id', verifyToken, checkRole(['ngo', 'donor', 'admin']), updateRequest);

module.exports = router;
