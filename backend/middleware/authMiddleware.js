const { auth, db } = require('../firebaseConfig');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    req.user = decodedToken;
    
    // Fetch custom role from Firestore users collection
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
      req.user.role = userDoc.data().role;
    } else {
      req.user.role = 'donor'; // Default role
    }
    
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
