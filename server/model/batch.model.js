'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const BatchSchema = new Schema({
	quantity: Number,
	batchRef: String,
	isFinish: { type: Boolean, default: false },
	product: new Schema({
		name: String,
		link: String
	}, {
		_id : false
	}),
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Batch = mongoose.model('Batch', BatchSchema);

module.exports = Batch;
