'use strict';

const Sale = require('../../model/sale.model');
const Order = require('../../model/order.model');
const config = require('../../config/environment');
const messenger = require('../../service/bot/fbmessenger');
const moment = require('moment');

const saleService = require('../../service/sale.service');

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

	return saleService.createSale(req.body, userId)
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

const migrate = function(req, res) {
	return Sale.find({}).populate(['promotionId', 'customerId',{
		path: 'promotionId',
		populate: {
			path: 'batchId'
		}
	}]).exec()
	.then(sales => {
		console.log(sales);
		if(!sales) {
			return res.status(404).end();
		}
		let promises = [];
		sales.forEach(sale => {
			if (sale.promotionId) {
				sale.promotion = {
					name: sale.promotionId.name,
					price: sale.promotionId.price
				}
				if (sale.promotionId.batchId) {
					sale.batch = {
						batchId: sale.promotionId.batchId._id,
						batchRef: sale.promotionId.batchId.batchRef
					}
				}
				sale.promotionId = null;
			}
			if (sale.customerId) {
				sale.customer = {
					name: sale.customerId.name,
					type: sale.customerId.type,
					refUserId: sale.customerId.refUserId
				}
				sale.customerId = null
			}

			promises.push(sale.save());
		});
		Promise.all(promises).then(result => {
			res.json(sales);
		});
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	let limit = 0;
	let isConsignment = { $in: [null, false, true] };

	if (req.query) {
		if(!isNaN(parseInt(req.query.limit))) {
			limit = parseInt(req.query.limit);
		}
		if (req.query.consignment) {
			if (req.query.consignment.toLowerCase() === 'true') {
				isConsignment = true;
			}
			else {
				isConsignment = { $in: [null, false] };
			}
		}
	}
	return Sale.find({ isDeleted: false, isConsignment })
	.sort({'createdAt': -1}).limit(limit)
	.populate(['promotionId', 'customerId', {
		path: 'promotionId',
		populate: {
			path: 'batchId'
		}
	}])
	.exec()
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
		{ $sort : { saleDate : 1} },
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

const verifyOrder = function(req, res) {
	let orderId = new ObjectId(req.params.id);

	return Order.findOneAndUpdate({ _id: orderId }, { $set: { 'payment.status': 'VERIFIED' } }, { new: true }).exec()
	.then(order => {
		messenger.sendReadyToShipMessage(order.customer.refUserId, order._id);
		res.json(order);
	})
	.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	index,
	destroy,
	summary,
	verifyOrder,
	migrate
};
