'use strict';

const Batch = require('./batch.model');
const Promotion = require('../promotion/promotion.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let batchId = req.params.id;

	return Batch.findOne({ _id: batchId }).exec()
	.then(batch => {
		if(!batch) {
			return res.status(404).end();
		}
		res.json(batch);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let batchData = Object.assign({ createdBy: userId }, req.body);
	return Batch.create(batchData)
	.then(batch => {
		if(!batch) {
			return res.status(404).end();
		}
		res.status = 201;
		res.json(batch);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return Batch.find().exec()
	.then(batch => {
		if(!batch) {
			return res.status(404).end();
		}
		res.json(batch);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let batchId = new ObjectId(req.params.id);

	Promotion.findOne({ batchId }).exec()
	.then(batch => {
		if (batch) {
			return res.status(400).json({ message: "Please remove Promotions associated with this Batch" });
		}
		return Batch.findOne({ _id: batchId }).remove().exec()
	})
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	index,
	destroy
};
