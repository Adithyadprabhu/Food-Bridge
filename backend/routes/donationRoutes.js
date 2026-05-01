const express = require('express');
const { createDonation, getDonations, getDonationById, deleteDonation } = require('../controllers/donationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole(['donor', 'admin']), createDonation);
router.get('/', verifyToken, getDonations);
router.get('/:id', verifyToken, getDonationById);
router.delete('/:id', verifyToken, checkRole(['donor', 'admin']), deleteDonation);

module.exports = router;
