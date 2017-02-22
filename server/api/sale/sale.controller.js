'use strict';

const Sale = require('./sale.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let saleId = req.params.id;

	return Sale.findOne({ _id: saleId }).exec()
	.then(sale => {
		if(!sale) {
			return res.status(404).end();
		}
		res.json(sale);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let saleData = Object.assign({ createdBy: userId }, req.body)
	return Sale.create(saleData)
	.then(sale => {
		if(!sale) {
			return res.status(404).end();
		}
		res.json(sale);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return Sale.find().exec()
	.then(sale => {
		if(!sale) {
			return res.status(404).end();
		}
		res.json(sale);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let saleId = new ObjectId(req.params.id);

	return Sale.findOne({ _id: saleId }).remove().exec()
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
