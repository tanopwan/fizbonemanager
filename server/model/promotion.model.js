'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const PromotionSchema = new Schema({
	name: String,
	price: Number,
	quantity: Number,
	product: new Schema({
		name: String,
		link: String,
		description: String,
	},
	{
		_id: false
	}),
	batch: new Schema({
		batchId: mongoose.Schema.Types.ObjectId,
		batchRef: String,
	},
	{
		_id: false
	}),
	group: { type: String, default: 'None' },
	isBilled: { type: Boolean, default: true },
	isActive: { type: Boolean, default: true },
	isNeedDelivery: { type: Boolean, default: true },
	isEnded: { type: Boolean, default: false },
	remark: { type: String },
	//batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // TODO remove
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
