'use strict';

const Promotion = require('./promotion.model');
const Sale = require('../sale/sale.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let promotionId = req.params.id;

	return Promotion.findOne({ _id: promotionId }).exec()
	.then(promotion => {
		if(!promotion) {
			return res.status(404).end();
		}
		res.json(promotion);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let promotionData = Object.assign({ createdBy: userId }, req.body)
	return Promotion.create(promotionData)
	.then(promotion => {
		if(!promotion) {
			return res.status(404).end();
		}
		res.json(promotion);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {

	let isEnded = { $in: [null, false] };

	if (req.query) {
		if (req.query.ended) {
			if (req.query.ended.toLowerCase() === 'true') {
				isEnded = true;
			}
			else if (req.query.ended.toLowerCase() === 'all') {
				isEnded = { $in: [null, false, true] };
			}
			else {
				isEnded = { $in: [null, false] };
			}
		}
	}

	return Promotion.find({ isEnded: isEnded }).populate({
		path: 'batchId',
		populate: {
			path: 'productId',
			model: 'Product'
		}
	}).exec()
	.then(promotion => {
		if(!promotion) {
			return res.status(404).end();
		}
		res.json(promotion);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let promotionId = new ObjectId(req.params.id);

	Sale.findOne({ promotionId }).exec()
	.then(sale => {
		if (sale) {
			return Promise.reject("Please remove Sales associated with this Promotion");
		}
		return Promotion.findOne({ _id: promotionId }).remove().exec()
	})
	.then(result => {
		res.json(result);
	})
	.catch(err => {
		res.status(500).json({ message: err })
	});
}

const setIsActive = function(req, res) {
	let promotionId = new ObjectId(req.params.id);
	let isActive = req.params.isActive;

	return Promotion.findOneAndUpdate({ _id: promotionId }, { $set: { isActive: isActive }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const setIsBilled = function(req, res) {
	let promotionId = new ObjectId(req.params.id);
	let isBilled = req.params.isBilled;

	return Promotion.findOneAndUpdate({ _id: promotionId }, { $set: { isBilled: isBilled }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const setIsEnded = function(req, res) {
	let promotionId = new ObjectId(req.params.id);
	let isEnded = req.params.isEnded;

	return Promotion.findOneAndUpdate({ _id: promotionId }, { $set: { isEnded: isEnded }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const setIsNeedDelivery = function(req, res) {
	let promotionId = new ObjectId(req.params.id);
	let isNeedDelivery = req.params.isNeedDelivery;

	return Promotion.findOneAndUpdate({ _id: promotionId }, { $set: { isNeedDelivery: isNeedDelivery }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	index,
	destroy,
	setIsActive,
	setIsBilled,
	setIsEnded,
	setIsNeedDelivery
};
