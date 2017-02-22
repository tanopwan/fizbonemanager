'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SaleSchema = new Schema({
	quantity: Number,
	PromotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
