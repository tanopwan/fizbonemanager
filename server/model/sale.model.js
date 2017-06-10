'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SaleSchema = new Schema({
	quantity: Number,
	description: String,
	saleDate: Date,
	orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
	tags: [String],
	bill: new Schema({
		bills: [new Schema({
			quantity: Number,
			price: Number,
			date: Date
		}, { _id: false })],
		total: Number,
		quantity: Number
	}, {
		_id : false
	}),
	product: new Schema({
		name: String,
		link: String
	}, {
		_id : false
	}),
	batch: new Schema({
		batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
		batchRef: String,
	}, {
		_id : false
	}),
	promotion: new Schema({
		name: String,
		price: Number,
		group: String
	}, {
		_id : false
	}),
	customer: new Schema({
		name: String,
		type: String,
		refUserId: String
	}, {
		_id : false
	}),
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
