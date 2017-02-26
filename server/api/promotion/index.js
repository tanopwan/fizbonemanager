'use strict';

const express = require('express');
const ctrl = require('./promotion.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/:id', ctrl.view);
router.get('/', ctrl.index);

router.use(auth.verifyMiddleware);

router.put('/:id/:isActive', ctrl.setIsActive);
router.post('/', ctrl.create);
router.delete('/:id', auth.hasRoleAdmin, ctrl.destroy);

module.exports = router;
