const User = require('../models/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ success: false, message: 'user or password cannot empty!' });

    const duplicate = await User.findOne({ userName: user }).exec();
    if (duplicate) return res.status(409).json({ success: false, message: 'username already exist', data: duplicate });

    try {
        const hashedPwd = await bcrypt.hash(pwd, 10);

        const result = await User.create({
            userName: user,
            password: hashedPwd
        });

        console.log(result);

        res.status(201).json({
            success: true,
            message: `new user ${user} created`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = handleNewUser;