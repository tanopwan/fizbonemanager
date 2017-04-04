'use strict';

const express = require('express');
const ctrl = require('./promotion.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/:id', ctrl.view);
router.get('/', ctrl.index);

router.use(auth.verifyMiddleware);

router.put('/:id/active/:isActive', ctrl.setIsActive);
router.put('/:id/billed/:isBilled', ctrl.setIsBilled);
router.put('/:id/ended/:isEnded', ctrl.setIsEnded);
router.put('/:id/needDelivery/:isNeedDelivery', ctrl.setIsNeedDelivery);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.destroy);

module.exports = router;
