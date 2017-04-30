'use strict';

const express = require('express');
const ctrl = require('./customer.controller');
const auth = require('../../auth');
const bodyParser = require('body-parser');

var router = express.Router();

router.post('/shipping-address', auth.verifyMessengerExtenstion, ctrl.shippingAddress);

router.get('/:id', ctrl.view);
router.get('/', ctrl.index);

router.use(auth.verifyMiddleware);

router.post('/', ctrl.create);
router.delete('/:id', ctrl.destroy);

module.exports = router;
