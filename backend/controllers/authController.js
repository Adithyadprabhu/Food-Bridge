const { auth, db } = require('../firebaseConfig');

const signup = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!['donor', 'ngo', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be donor, ngo, or admin.' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Save user metadata in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  // Login is strictly handled on the frontend using Firebase Client SDK.
  // The frontend receives an ID Token, and sends it to the backend via Authorization header.
  res.status(200).json({ message: 'Login is handled by Firebase Client SDK on frontend.' });
};

module.exports = { signup, login };
