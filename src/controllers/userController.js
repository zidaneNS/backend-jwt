const User = require('../models/User');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if(!users) return res.status(204).json({ success: true, message: 'users empty'});
    res.status(200).json({ success: true, message: 'success retrieving all datas', data: users });
};

const deleteUser = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ success: false, message: 'user id required' });
    const id = req.params.id;
    const user = await User.findOne({ _id: id }).exec();

    if(!user) return res.status(404).json({ success: false, message: 'id not found' });
    const result = await User.deleteOne({ _id: id});
    res.status(200).json({ success: true, message: `user with id ${id} has been deleted` });
};

const getUserById = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ success: false, message: 'user id required' });
    const id = req.params.id;
    const user = await User.findOne({ _id: id }).exec();

    if(!user) return res.status(404).json({ success: false, message: 'id not found' });
    res.status(200).json({ success: true, message: 'success retrieving data', data: user });
}

module.exports = {getAllUsers, deleteUser, getUserById};