'use strict';

const Batch = require('./batch.model');
const config = require('../../config/environment');

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

	let batchData = Object.assign({ createdBy: userId }, {req.data})
	return Batch.create(batchData).exec()
	.then(batch => {
		if(!batch) {
			return res.status(401).end();
		}
		res.json(batch);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return Batch.find().exec()
	.then(batch => {
		if(!batch) {
			return res.status(401).end();
		}
		res.json(batch);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	return Batch.findOne({ _id: batchId }).remove().exec()
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
