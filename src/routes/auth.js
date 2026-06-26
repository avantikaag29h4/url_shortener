const express = require('express');
const router = express.Router();
const {register, login, forgotPassword, resetPassword, deleteAccount} = require('../controllers/authController') ;
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register',register);
router.post('/login',login);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);
router.delete('/delete-account',authMiddleware, deleteAccount);

module.exports = router;
