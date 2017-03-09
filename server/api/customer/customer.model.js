'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const CustomerSchema = new Schema({
	name: String,
	address: String,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
