const { db } = require('../firebaseConfig');
const crypto = require('crypto');

const createDonation = async (req, res) => {
  try {
    const { foodType, quantity, expiryTime, location } = req.body;
    const donorId = req.user.uid;

    const id = crypto.randomUUID();
    const donation = {
      id,
      donorId,
      foodType,
      quantity,
      expiryTime,
      location,
      status: 'available',
      createdAt: new Date().toISOString()
    };

    await db.collection('donations').doc(id).set(donation);
    res.status(201).json({ message: 'Donation created successfully', donation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDonations = async (req, res) => {
  try {
    const snapshot = await db.collection('donations').where('status', '==', 'available').get();
    const donations = snapshot.docs.map(doc => doc.data());
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const doc = await db.collection('donations').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Donation not found' });
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const docRef = db.collection('donations').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) return res.status(404).json({ error: 'Donation not found' });
    
    const donationData = doc.data();
    
    // Only owner or admin can delete
    if (donationData.donorId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You do not own this donation' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDonation, getDonations, getDonationById, deleteDonation };
