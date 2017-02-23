'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SaleSchema = new Schema({
	quantity: Number,
	description: String,
	saleDate: Date,
	promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
