const { db } = require('../firebaseConfig');

const getStats = async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const donationsSnap = await db.collection('donations').get();
    const requestsSnap = await db.collection('requests').get();

    res.status(200).json({
      totalUsers: usersSnap.size,
      totalDonations: donationsSnap.size,
      totalRequests: requestsSnap.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const snapshot = await db.collection('requests').where('status', '==', 'completed').get();
    const transactions = snapshot.docs.map(doc => doc.data());
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStats, getTransactions };
