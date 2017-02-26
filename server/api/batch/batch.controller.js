'use strict';

const Batch = require('./batch.model');
const Promotion = require('../promotion/promotion.model');
const Sale = require('../sale/sale.model');
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

const stock2 = function(req, res) {
	let batchId = new ObjectId(req.params.id);
	let batchDoc = null;
	Batch.findOne({ _id: batchId }).exec()
	.then(batch => {
		if(!batch) {
			return res.status(404).json({ message: 'Batch not found' });
		}
		batchDoc = batch;
		return Promotion.find({ batchId }).select(['_id']).exec();
	})
	.then(promotions => {
		return Sale.find({ promotionId: { $in: promotions }}).populate('promotionId');
	})
	.then(sales => {
		let totalQuantity = 0;
		let totalAmount = 0;
		sales.forEach(sale => {
			totalQuantity += sale.quantity;
			totalAmount += sale.quantity * sale.promotionId.price;
		});
		let inStock = batchDoc.quantity - totalQuantity;
		batchDoc.isInStock = inStock > 0 ? true : false;

		res.json({
			totalQuantity,
			totalAmount,
			inStock,
			sales
		});
		return batchDoc.save();
	})
	.then(result => console.log(result))
	.catch(err => res.status(500).json(err));
}

const stock = function(req, res) {
	Sale.aggregate([
		{
			$match: { isDeleted: { $eq: false } }
		},
		{
			$lookup: {
		        "from": "promotions",
		        "localField": "promotionId",
		        "foreignField": "_id",
		        "as": "promotion"
		    }
		},
		{
			$unwind: '$promotion'
		},
		{
			$lookup: {
		        "from": "batches",
		        "localField": "promotion.batchId",
		        "foreignField": "_id",
		        "as": "batch"
		    }
		},
		{
			$unwind: '$batch'
		},
		{
			$group: {
				_id: '$promotion.batchId',
				batchName: { $first: '$batch.batchRef' },
				totalQuantity: { $sum: '$quantity' },
				transaction: { $sum: 1 },
				totalStock: { $first: '$batch.quantity' }
			}
		}
	]).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const summary = function(req, res) {
	Sale.aggregate({
		$group:
		{
			_id: '$promotionId',
			totalAmount: { $sum: "$quantity" },
			transaction: { $sum: 1 }
		}
	}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}
/*stock({ params: { id: '58ab09186e5ea828f4571981' } }, {json: (result) => {
	console.log(result);
}});*/

module.exports = {
	view,
	create,
	index,
	destroy,
	stock
};
