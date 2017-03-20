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

const batch = function(req, res) {
	Batch.aggregate([
		//{ $match: { isFinish: { $eq: false } } },
		{ $sort : { createdAt : -1 } },
		{
			$lookup: {
				"from": "products",
				"localField": "productId",
				"foreignField": "_id",
				"as": "product"
			}
		},
		{
			$unwind: '$product'
		},
		{
			$group: {
				_id: '$product._id',
				name: { $first: '$product.name' },
				batches: { $sum: 1 },
				finishedBatches: {
					$sum: {
						$cond: [
							{
								$eq: ["$isFinish", true]
							},
							1,
							0
						]
					}
				},
				batches: { $push:  { batchRef: "$batchRef", quantity: "$quantity", isFinish: "$isFinish" } }
			}
		}
	]).exec()
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
	batch
};
