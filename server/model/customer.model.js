'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const CustomerSchema = new Schema({
	name: String,
	address: {
		name: String,
		street: String,
		subDistrict: String,
		district: String,
		province: String,
		postalCode: String
	},
	type: String,
	refUserId: String,
	ref: new Schema({}, { strict: false })
},
{
	timestamps: true
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
