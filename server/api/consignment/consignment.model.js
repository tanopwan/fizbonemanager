'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const ConsignmentSchema = new Schema({
	quantity: Number,
	description: String,
	saleDate: Date,
	isDeleted: { type: Boolean, default: false },
	promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Consignment = mongoose.model('Consignment', ConsignmentSchema);

module.exports = Consignment;
