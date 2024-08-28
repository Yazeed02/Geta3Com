const express = require('express');
const {checkEmail, register, login, verifyEmail, forgotPassword,refresh_token, logout, getProfile, deleteUser,Geta3_authorize, admin_acceptance, sendPhoneVerification, verifyPhoneNumber, changePassword, updateLocation, fetchUserPosts
} = require('../controllers/AuthController');
const router = express.Router();
const passport = require('passport');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Not authorized. Admin access required." });
};

router.post('/check-email', checkEmail);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/refresh_token', refresh_token);
router.post('/logout', logout);
router.post('/send-phone-verification', sendPhoneVerification);
router.post('/verify-phone', verifyPhoneNumber);
router.post('/change-password', passport.authenticate('jwt', { session: false }), changePassword);
router.post('/update-location', passport.authenticate('jwt', { session: false }), updateLocation);
router.get('/user-posts/:userId', fetchUserPosts); // New route

router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);
router.put('/delete_profile/:userId', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/authorize', passport.authenticate('jwt', { session: false }), isAdmin, Geta3_authorize);
router.post('/admin/acceptance/:id', passport.authenticate('jwt', { session: false }), isAdmin, admin_acceptance);

module.exports = router;
