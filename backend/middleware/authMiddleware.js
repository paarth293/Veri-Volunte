const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No token provided or invalid format.' 
    });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();

  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token.' 
    });
  }
};

module.exports = { verifyToken };