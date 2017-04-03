'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const BillSchema = new Schema({
	quantity: Number,
	saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleSchema' }
},
{
	timestamps: true
})

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;
