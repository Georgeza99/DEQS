const express = require('express');
const router = express.Router();
const userController = require('./controller');


//get user
router.get('/users', userController.getData);

// add user
router.post('/users', userController.addUser);

// edit user
router.put('/users/:name', userController.editUser);


// delete user
router.delete('/users/:name', userController.deleteUser);

module.exports = router;