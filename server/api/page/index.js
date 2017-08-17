'use strict';

const express = require('express');
const ctrl = require('./page.controller');
const auth = require('../../auth');

var router = express.Router();

router.use(auth.verifyMiddleware);

router.get('/conversations', ctrl.conversations);
router.get('/id_for_page/:id', ctrl.idForPage);

module.exports = router;
