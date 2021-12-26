const jwt = require("jsonwebtoken");
const config = require('config');

module.exports = function (req, res, next) {
    //get the token 
    const token = req.header("x-auth-token");

    //check if no token 
    if (!token) {
        return res.status(401).json({msg:"No token generated , Authorization Failed"})
    }

    //verify token 
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user
        next();
    } catch (err) {
        res.status(401).json({msg:"Token Verification failed"})
    }


}
