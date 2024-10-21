const User = require('../models/User');

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(204).json({ success: true, message: 'refresh token empty' });

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
        return res.status(204).json({ success: true, message: 'user not found' });
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    const result = foundUser.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
    res.status(204).json({ success: true, message: 'logout succeed' });
}