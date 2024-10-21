const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'unauthorized' });
    const accessToken = authHeader.split(' ')[1];
    console.log(accessToken);

    if (!accessToken) return res.status(403).json({ success: false, message: 'forbidden' });
    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ success: false, message: 'forbidden' });
            const foundUser = await User.findOne({ userName: decoded.userInfo.userName }).exec();
            if (!foundUser) return res.status(404).json({ success: false, message: 'user not found '});
            req.user = foundUser.userName;
            console.log(req.user);

            next();
        }
    );

}

module.exports = verifyJwt;