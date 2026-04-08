const { db } = require('../config/firebase');

const isNGO = async (req, res, next) => {
  try {
    if(!req.user || !req.user.uid) {
      return res.status(401).json({
        error: 'Unauthorized: User not recognized'
      });
    }

    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if(!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'NGO') {
      return res.status(403).json({ 
        error: 'Forbidden: Only verified NGOs can perform this action' 
      });
    }

    next();

  }catch(error) {
    console.error('Error checking NGO role:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = { isNGO };