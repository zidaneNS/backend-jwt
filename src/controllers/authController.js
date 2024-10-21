const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const cookies = req.cookies;

    const {user, pwd} = req.body;
    if(!user || !pwd) return res.status(400).json({ success: false, message: 'user or password cannot empty' });

    const foundUser = await User.findOne({ userName: user });
    if (!foundUser) return res.status(404).json({ success: false, status: 'user not found '});

    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        const accessToken = jwt.sign(
            {
                userInfo: {
                    userName: foundUser.userName,
                    roles: roles
                }
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );

        const newRefreshToken = jwt.sign(
            { userName: foundUser.userName },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1m' }
        );

        let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const foundToken = await User.findOne( {refreshToken }).exec();

            if (!foundToken) {
                newRefreshTokenArray = [];
            }

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'});
        }

        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();

        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24*60*60*1000 });

        res.status(200).json({ success: true, message: 'login succeed', accessToken });
    } else {
        res.status(401).json({ success: false, message: 'unauthorized' });
    }
};

module.exports = handleLogin;