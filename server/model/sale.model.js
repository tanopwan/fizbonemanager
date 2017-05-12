'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SaleSchema = new Schema({
	quantity: Number,
	description: String,
	saleDate: Date,
	orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
	isConsignment: { type: Boolean, default: false },
	isDeleted: { type: Boolean, default: false },
	bill: new Schema({
		price: Number,
		bills: [{
			quantity: Number,
			date: Date
		}],
		total: Number
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
	promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
	promotion: new Schema({
		name: String,
		price: Number,
		group: String
	}, {
		_id : false
	}),
	customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
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
