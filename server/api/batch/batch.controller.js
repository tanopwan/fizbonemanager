'use strict';

const Batch = require('../../model/batch.model');
const Promotion = require('../../model/promotion.model');
const Sale = require('../../model/sale.model');

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
	let productId = req.body.productId;

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
	.then(promotion => {
		if (promotion) {
			return res.status(400).json({ message: "Please remove Promotions associated with this Batch" });
		}
		return Batch.findOne({ _id: batchId }).remove().exec()
	})
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const stock = function(req, res) {
	Sale.aggregate([
		{ $match: { isDeleted: { $eq: false } } },
		{ $sort : { saleDate : 1 } },
		{
			$lookup: {
		        "from": "batches",
		        "localField": "batch.batchId",
		        "foreignField": "_id",
		        "as": "batchId"
		    }
		},
		{
			$unwind: '$batchId'
		},
		{
			$group: {
				_id: '$batch.batchId',
				productName: { $first: '$product.name' },
				batchName: { $first: '$batch.batchRef' },
				totalQuantity: { $sum: '$quantity' },
				transaction: { $sum: 1 },
				totalStock: { $first: '$batchId.quantity' },
				deliveries: {
					$sum: {
						$cond: [
							{
								$eq: ["$promotion.isNeedDelivery", false]
							},
							0,
							1
						]
					}
				},
				transactions: { $push:  { saleDate: "$saleDate", quantity: "$quantity" } }
			}
		}
	]).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const stockById = function(req, res) {
	let batchId = new ObjectId(req.params.id);

	Sale.aggregate(
		{
			$match: {
				isDeleted: { $eq: false },
				'batch._id': { $eq: batchId }
			}
		},
		{
			$group: {
				_id: '$promotion._id',
				promotionName: { $first: '$promotion.name' },
				promotionGroup: { $first: '$promotion.group' },
				totalQuantity: { $sum: '$quantity' },
				transaction: { $sum: 1 },
				totalStock: { $first: '$batch.quantity' },
				deliveries: {
					$sum: {
						$cond: [
							{
								$eq: ["$promotion.isNeedDelivery", false]
							},
							0,
							1
						]
					}
				},
			}
		}
	).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const setIsFinish = function(req, res) {
	let objectId = new ObjectId(req.params.id);
	let isFinish = req.params.isFinish;

	return Batch.findOneAndUpdate({ _id: objectId }, { $set: { isFinish: isFinish }}).exec()
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
	stock,
	stockById,
	setIsFinish
};
