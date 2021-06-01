const express = require('express');
const router = express.Router();


const {
    validRegister,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/valid')




const {
    registerController,
    activationController, 
    loginController
} = require('../controllers/auth.controller')

router.post('/register',validRegister, registerController)
router.post('/login',validLogin, loginController)
router.post('/activate', activationController)

module.exports = router
