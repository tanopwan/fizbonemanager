'use strict';

const express = require('express');
const ctrl = require('./sale.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/', ctrl.index);
router.get('/migrate', ctrl.migrate);
router.get('/summary', ctrl.summary);
router.get('/:id', ctrl.view);

router.use(auth.verifyMiddleware);

router.post('/', ctrl.create);
router.post('/order/:id', ctrl.verifyOrder);
router.post('/bill/:id', ctrl.bill);
router.delete('/:id', ctrl.destroy);

module.exports = router;
