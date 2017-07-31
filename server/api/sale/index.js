'use strict';

const express = require('express');
const ctrl = require('./sale.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/', ctrl.index);
router.get('/migrate', ctrl.migrate);
router.get('/summary', ctrl.summary);
router.get('/orders', ctrl.indexOrders);
router.get('/:id', ctrl.view);
router.get('/orders/:id', ctrl.viewOrder);

router.use(auth.verifyMiddleware);

router.post('/', ctrl.create);
router.post('/orders', ctrl.createOrder);
router.post('/order/:id', ctrl.verifyOrder);
router.post('/order/:id/tracking', ctrl.setTracking);
router.post('/bill/:id', ctrl.bill);
router.post('/:id', ctrl.update);
router.delete('/:id', ctrl.destroy);

module.exports = router;
