'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const OrderSchema = new Schema({
	items: [{
		saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
		batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
		quantity: Number,
		price: Number,
		product: {
			name: String,
			link: String
		},
		total: Number
	}],
	address: {
		name: String,
		street: String,
		subDistrict: String,
		district: String,
		province: String,
		postalCode: String
	},
	shipping: new Schema({
		status: String, //WAIT_VERIFIED, READY, PACKING, DROPOFF, DELIVERED
		type: String,
		trackingNo: String
	}, { _id : false }),
	payment: new Schema({
		method: String,
		attachments: [String],
		status: String, //WAIT, SLIP_PENDING, VERIFIED
	}, { _id : false }),
	subTotal: Number,
	shippingFee: Number,
	total: Number,
	status: String, //OPEN, CLOSE, FINISH
	customer: {
		name: String,
		refUserId: String
	}
},
{
	timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
