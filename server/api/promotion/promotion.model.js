'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const PromotionSchema = new Schema({
	name: String,
	price: Number,
	quantity: Number,
	batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

// Getter
PromotionSchema.path('price').get(function(num) {
  return (num / 100).toFixed(2);
});

// Setter
PromotionSchema.path('price').set(function(num) {
  return num * 100;
});

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
