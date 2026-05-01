const { db } = require('../firebaseConfig');
const crypto = require('crypto');

const createRequest = async (req, res) => {
  try {
    const { neededQuantity, category } = req.body;
    const ngoId = req.user.uid;

    // --- Smart Allocation Logic ---
    const snapshot = await db.collection('donations')
      .where('status', '==', 'available')
      .get();
    
    let donations = snapshot.docs.map(doc => doc.data());

    if (donations.length === 0) {
      return res.status(404).json({ error: 'No available donations match your criteria at the moment.' });
    }

    // Sort by Expiry Time (Near expiry first)
    // We could also factor in distance if coordinates are provided
    donations.sort((a, b) => new Date(a.expiryTime) - new Date(b.expiryTime));

    const bestMatch = donations[0]; // Simplistic best match

    const id = crypto.randomUUID();
    const request = {
      id,
      ngoId,
      donationId: bestMatch.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save request
    await db.collection('requests').doc(id).set(request);

    // Update donation status to "requested" to avoid double-booking
    await db.collection('donations').doc(bestMatch.id).update({
      status: 'requested',
      requestedBy: ngoId
    });

    res.status(201).json({ message: 'Request matched with donation', request, matchedDonation: bestMatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    let query = db.collection('requests');
    
    // If user is NGO, only return their requests
    if (req.user.role === 'ngo') {
      query = query.where('ngoId', '==', req.user.uid);
    }

    const snapshot = await query.get();
    const requests = snapshot.docs.map(doc => doc.data());
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'rejected', 'completed'
    const reqId = req.params.id;

    const requestRef = db.collection('requests').doc(reqId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) return res.status(404).json({ error: 'Request not found' });

    const requestData = requestDoc.data();
    const donationRef = db.collection('donations').doc(requestData.donationId);

    // Update request status
    await requestRef.update({ status });

    // Sync donation status based on request status
    if (status === 'completed') {
      await donationRef.update({ status: 'completed' });
    } else if (status === 'rejected') {
      await donationRef.update({ status: 'available', requestedBy: null });
    }

    res.status(200).json({ message: `Request status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRequest, getRequests, updateRequest };
