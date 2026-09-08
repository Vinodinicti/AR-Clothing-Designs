const express = require('express');
const router = express.Router();
const {
    getUserStats,
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

router.get('/stats', getUserStats);

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
