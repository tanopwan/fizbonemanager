'use strict';

const express = require('express');
const ctrl = require('./customer.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/:id', ctrl.view);
router.get('/', ctrl.index);
router.post('/shipping-address', auth.verifyMessengerExtenstion, ctrl.shippingAddress);

router.use(auth.verifyMiddleware);

router.post('/', ctrl.create);
router.delete('/:id', ctrl.destroy);

module.exports = router;
