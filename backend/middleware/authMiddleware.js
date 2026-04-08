const admin = require("../config/firebase");

const verification = async(req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startWith('Bearer')) {
        return res.status(401).json({
            errro: 'Unauthorized',
            message: 'No token provided or invalid format'
        });
}