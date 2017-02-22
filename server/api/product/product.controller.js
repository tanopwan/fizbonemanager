'use strict';

const Product = require('./product.model');
const Batch = require('../batch/batch.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let productId = req.params.id;

	return Product.findOne({ _id: productId }).exec()
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);
	let productData = Object.assign({ createdBy: userId }, req.body);
	console.log(productData);
	return Product.create(productData)
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return Product.find().exec()
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let productId = new ObjectId(req.params.id);

	Batch.findOne({ productId }).exec()
	.then(product => {
		if(product) {
			return res.status(400).json({ message: "Please remove Batches associated with this Product"});
		}
		return Product.findOne({ _id: productId }).remove().exec();
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
