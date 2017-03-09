'use strict';

const Sale = require('./sale.model');
const config = require('../../config/environment');
const moment = require('moment');

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

	let saleData = Object.assign({ createdBy: userId, isDeleted: false }, req.body)
	return Sale.create(saleData)
	.then(sale => {
		if(!sale) {
			return res.status(404).end();
		}
		return Sale.populate(sale, { path: 'promotionId'});
	})
	.then(sale => {
		if(!sale) {
			return res.status(404).end();
		}
		res.json(sale);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json(err);
	});
}

const index = function(req, res) {
	let limit = 0;
	let isConsignment = { $in: [null, false] };

	if (req.query) {
		if(!isNaN(parseInt(req.query.limit))) {
			limit = parseInt(req.query.limit);
		}

		if (req.query.consignment == 'true') {
			isConsignment = true;
		}
	}

	return Sale.find({ isDeleted: false, isConsignment: {$in: [null, false]} }).sort({'saleDate': -1}).limit(limit).populate('promotionId').exec()
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

	return Sale.findOneAndUpdate({ _id: saleId }, { $set: { isDeleted: true }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const summary = function(req, res) {
	Sale.aggregate([
		{
			$match: { isDeleted: { $eq: false } }
		},
		{
			"$lookup": {
		        "from": "promotions",
		        "localField": "promotionId",
		        "foreignField": "_id",
		        "as": "promotion"
		    }
		},
		{
			"$unwind": '$promotion'
		},
		{
			$group: {
				_id: { month: { $month: "$saleDate"}, year: { $year: "$saleDate" } },
				totalQuantity: { $sum: "$quantity" },
				totalAmount: { $sum: { $multiply: [ "$promotion.price", "$quantity" ] } },
				transaction: { $sum: 1 },
				promotions: { $addToSet: "$promotion.name" }
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
	summary
};
