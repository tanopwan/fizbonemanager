'use strict';

const Sale = require('../../model/sale.model');
const Order = require('../../model/order.model');
const config = require('../../config/environment');
const messenger = require('../../service/bot/fbmessenger.service');
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
	let userId = new ObjectId(req.user._id);

	return saleService.createSale(req.body, userId)
	.then(sale => {
		res.json(sale);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json(err);
	});
}

const migrate = function(req, res) {
	//return res.status(501);
	return Sale.find().exec()
	.then(sales => {
		if(!sales) {
			return res.status(404).end();
		}
		console.log("Found " + sales.length + " rows");
		let promises = [];
		sales.forEach(sale => {
			if (sale.bill) {
				let temp = sale.bill.total;
				sale.bill.total = sale.bill.quantity;
				sale.bill.quantity = temp;
				promises.push(sale.save());
			}
		});
		console.log("Migrate " + promises.length + " rows");
		return Promise.all(promises).then(result => {
			res.json(promises);
		});
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	if (req.query) {
		return saleService.getSales(req.query.limit, req.query.group, req.query.from, req.query.to)
		.then(sale => {
			if(!sale) {
				return res.status(404).end();
			}
			res.json(sale);
		})
		.catch(err => res.status(500).json(err));
	}
	else {
		return saleService.getSales(0, null, null)
		.then(sale => {
			if(!sale) {
				return res.status(404).end();
			}
			res.json(sale);
		})
		.catch(err => res.status(500).json(err));
	}

}

const destroy = function(req, res) {
	let saleId = new ObjectId(req.params.id);

	return Sale.findOne({ _id: saleId }).remove().exec()
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
			$group: {
				_id: { month: { $month: "$saleDate" }, year: { $year: "$saleDate" } },
				totalQuantity: { $sum: "$quantity" },
				totalAmount: { $sum: "$bill.total" },
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

	return Order.findOneAndUpdate({ _id: orderId },{
		$set: { 'payment.status': 'VERIFIED' }
	}, { new: true }).exec()
	.then(order => {
		messenger.sendReadyToShipMessage(order.customer.refUserId, order._id);
		res.json(order);
	})
	.catch(err => res.status(500).json(err));
}

const setTracking = function(req, res) {
	let orderId = new ObjectId(req.params.id);
	let trackingNo = req.body.trackingNo;
	let type = req.body.type;
	let dropoffDateTime = req.body.dropoffDateTime;

	if (orderId && trackingNo && type && dropoffDateTime) {
		return Order.findOneAndUpdate({ _id: orderId }, {
			$set: {
				'shipping.trackingNo': trackingNo,
				'shipping.type': type,
				'shipping.status': 'DROPOFF',
				'shipping.dropoffDateTime': dropoffDateTime
			}
		}, { new: true }).exec()
		.then(order => {
			messenger.sendDropOffUpdate(order);
			res.json(order);
		})
		.catch(err => res.status(500).json(err));
	}
	res.status(400).json({ message: "Invalid Parameters" });
}

const bill = function(req, res) {
	let saleId = new ObjectId(req.params.id);
	let quantity = req.body.quantity;
	let price = req.body.price;

	if (quantity <= 0 || price <= 0) {
		return res.status(400).json({ message: "quantity should be positive number"});
	}

	return Sale.findOneAndUpdate({ _id: saleId }, {
		$push: {
			"bill.bills": { quantity: quantity, price: price, date: new Date() }
		},
		$inc: {
			"bill.total": quantity * price,
			"bill.quantity": quantity
		}
	}, { new: true }).exec()
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
	summary,
	verifyOrder,
	migrate,
	bill,
	setTracking
};
