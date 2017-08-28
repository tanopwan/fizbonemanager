'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const CustomerSchema = new Schema({
	name: String,
	email: String,
	billingAddress: {
		name: String,
		street: String,
		subDistrict: String,
		district: String,
		province: String,
		postalCode: String
	},
	// Shipping Address
	address: {
		name: String,
		number: String,
		street: String,
		subDistrict: String,
		district: String,
		province: String,
		postalCode: String
	},
	type: String,
	role: String,
	refUserId: String,
	ref: new Schema({}, { strict: false }),
	fb: {
		psid: String,
		participantId: String,	// Conversation Participants User Id {page_id}/conversations
	}
},
{
	timestamps: true
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
