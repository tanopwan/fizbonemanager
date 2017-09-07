'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const OrderSchema = new Schema({
	customer: new Schema({
		name: String,
		refUserId: String,
		type: String,
	}, { _id : false }),
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
		trackingNo: String,
		dropoffDateTime: Date
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
	saleDate: Date,
	description: String,
	channel: String,
	extendsInfo: {},
},
{
	timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
