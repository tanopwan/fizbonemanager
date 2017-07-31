'use strict';

const SaleSchema = require('./sale.schema');
const mongoose = require('mongoose');

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
