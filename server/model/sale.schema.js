'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const SaleSchema = new Schema(
	{
		quantity: Number,
		bill: new Schema({
			bills: [new Schema({
				quantity: Number,
				price: Number,
				date: Date
			}, { _id: false })],
			total: Number,
		}, {
				_id: false
			}),
		product: new Schema({
			name: String,
			link: String,
			barcode: String,
			productCode: String,
		}, {
				_id: false
			}),
		batch: new Schema({
			batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
			batchRef: String,
		}, {
				_id: false
			}),
		promotion: new Schema({
			name: String,
			price: Number,
			group: String
		}, {
				_id: false
			}),
		customer: new Schema({
			name: String,
			type: String,
			refUserId: String
		}, {
				_id: false
			}),
		saleDate: Date,
		description: String,
		orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		tags: [String],
	},
	{
		timestamps: true
	}
);

module.exports = SaleSchema;
