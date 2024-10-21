const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ success: false, message: 'unauthorized' });
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const foundUser = await User.findOne({ refreshToken }).exec();

    // reused token or hacked
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.status(403).json({ success: false, message: 'forbidden' });

                const hackedUser = await User.findOne({ userName: decoded.userName }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
            }
        )

        return res.status(403).json({ success: false, message: 'forbidden' });
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                // expired
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if (err || foundUser.userName !== decoded.userName) return res.status(403).json({ success:false, message: 'forbidden' });

            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    userInfo: {
                        userName: foundUser.userName,
                        roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );

            const newRefreshToken = jwt.sign(
                {userName: foundUser.userName},
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1m' }
            );

            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None'});
            res.status(200).json({ success: true, message: 'new access token gained', accessToken });
        }
    );
};

module.exports = handleRefreshToken;