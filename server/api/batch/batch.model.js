'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const BatchSchema = new Schema({
	quantity: Number,
	factoryRef: String,
	productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Batch = mongoose.model('Batch', BatchSchema);

module.exports = Batch;
