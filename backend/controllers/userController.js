const { db } = require('../config/firebase');

const registerUser = async (req, res) => {
    try {
        const { uid, email } = req.user;

        const { name, role } = req.body;

        const assignedRole = role === 'NGO' ? 'NGO' : 'Volunteer';

        const userRef = db.collection('users').doc(uid);
        const userDoc = await useRef.get();

        if(userDoc.exists) {
            return res.status(200).json({
                message: 'Login successful',
                user: userDoc.data()
            });
        }

        

        
    }
}