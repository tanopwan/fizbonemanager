'use strict';

const Product = require('../../model/product.model');
const Batch = require('../../model/batch.model');
const config = require('../../config/environment');
const productService = require('../../service/product.service');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let productId = req.params.id;

	return productService.getProduct(productId)
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.user._id);

	return productService.createProduct(req.body, userId)
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const update = function(req, res) {
	let productId = new ObjectId(req.params.id);

	return productService.updateProduct(req.body, productId)
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const online = function(req, res) {
	return productService.getOnlineProducts()
	.then(product => {
		if(!product) {
			return res.status(404).end();
		}
		res.json(product);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return productService.getProducts()
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
		{ $match: { isFinish: { $eq: false } } },
		{ $sort : { createdAt : -1 } },
		{
			$group: {
				_id: '$product.productCode',
				name: { $first: '$product.name' },
				productCode: { $first: '$product.productCode' },
				barcode: { $first: '$product.barcode' },
				link: { $first: '$product.link' },
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
				batches: {
					$push:  {
						_id: "$_id",
						batchRef: "$batchRef",
						quantity: "$quantity",
						isFinish: "$isFinish"
					}
				}
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
	update,
	index,
	destroy,
	batch,
	online,
};
