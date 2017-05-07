'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const PromotionSchema = new Schema({
	name: String,
	price: Number,
	quantity: Number,
	isBilled: { type: Boolean, default: true },
	isActive: { type: Boolean, default: true },
	isNeedDelivery: { type: Boolean, default: true },
	isEnded: { type: Boolean, default: false },
	group: { type: String, default: 'None' },
	batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

// Setter
PromotionSchema.path('price').set(function(num) {
  return num * 100;
});

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
