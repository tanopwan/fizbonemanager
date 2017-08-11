'use strict';

const express = require('express');
const user = require('./page.controller');
const auth = require('../../auth');

var router = express.Router();

router.use(auth.verifyMiddleware);

router.get('/conversations', user.conversations);

module.exports = router;
