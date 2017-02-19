'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SellSchema = new Schema({
	quantity: Number,
	price: Number,
	ItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
  timestamps: true
});

// Getter
SellSchema.path('price').get(function(num) {
  return (num / 100).toFixed(2);
});

// Setter
SellSchema.path('price').set(function(num) {
  return num * 100;
});

const Sell = mongoose.model('Sell', SellSchema);

module.exports = Sell;
