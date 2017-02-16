'use strict';

module.exports = require('./auth.service');

const express = require('express');
const router = express.Router();

const config = require('../config/environment');
const User = require('../api/user/user.model');

// setup facebook passport
require('./facebook/passport')(User, config);
router.use('/facebook', require('./facebook'));

module.exports.facebookRouter = router;
