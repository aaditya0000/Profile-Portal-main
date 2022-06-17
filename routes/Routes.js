const { Router } = require('express');
const controller = require('../controller/Controller');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Skill = require('../models/skills');
const Interest = require('../models/interests');
const Por = require('../models/pors');
require('dotenv').config();

const router = Router();

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_Secretkey, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        //console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// checking current user middleware
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_Secretkey, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

// routes
router.get('*',checkUser);
router.get('/', requireAuth, controller.homepage_get);
router.get('/login', controller.login_get);
router.post('/login', controller.login_post);
router.get('/signup', controller.signup_get);
router.post('/signup', controller.signup_post);
router.get('/editprofile', requireAuth, controller.editprofile_get);
router.put('/editprofile', controller.editprofile_put);
router.get('/about', controller.about_get);
router.get('/forgotPassword', controller.forgotPassword_get);
router.post('/forgotPassword', controller.forgotPassword_post);
router.get('/resetPassword', controller.resetPassword_get);
router.post('/resetPassword', controller.resetPassword_post);
router.get('/logout', controller.logout_get);
router.get('/verifyEmail', controller.verifyEmail_get);

module.exports = router;
