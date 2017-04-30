'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const CustomerSchema = new Schema({
	name: String,
	address: {
		street_1: String,
		street_2: String,
		city: String,
		province: String,
		postalCode: String
	},
	type: String,
	refUserId: String
},
{
	timestamps: true
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
