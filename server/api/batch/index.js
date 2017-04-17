'use strict';

const express = require('express');
const ctrl = require('./batch.controller');
const auth = require('../../auth');

var router = express.Router();

router.get('/stock', ctrl.stock);
router.get('/:id', ctrl.view);
router.get('/stock/:id', ctrl.stockById);
router.get('/', ctrl.index);

router.use(auth.verifyMiddleware);

router.put('/:id/finish/:isFinish', ctrl.setIsFinish);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.destroy);

module.exports = router;
