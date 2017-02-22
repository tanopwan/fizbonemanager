'use strict';

const express = require('express');
const ctrl = require('./promotion.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/:id', ctrl.view);

router.use(auth.verifyMiddleware);

router.get('/', ctrl.index);
router.post('/', ctrl.create);
router.delete('/:id', auth.hasRoleAdmin, ctrl.destroy);

module.exports = router;
