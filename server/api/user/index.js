'use strict';

const express = require('express');
const user = require('./user.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/show/:id', user.show);

router.use(auth.verifyMiddleware);

router.get('/me', user.me);
router.get('/page', user.page);
router.get('/', auth.hasRoleAdmin, user.index);
router.put('/profile', user.profile);
router.delete('/:id', auth.hasRoleAdmin, user.destroy);
router.get('/logout', user.logout);

module.exports = router;
