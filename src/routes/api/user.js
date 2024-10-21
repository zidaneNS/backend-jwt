const express = require('express');
const router = express.Router();
const {getAllUsers, deleteUser, getUserById} = require('../../controllers/userController');

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUserById)
    .delete(deleteUser);

module.exports = router;