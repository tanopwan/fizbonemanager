'use strict';

const Customer = require('../../model/customer.model');
const Sale = require('../sale/sale.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let customerId = req.params.id;

	return Customer.findOne({ _id: customerId }).exec()
	.then(customer => {
		if(!customer) {
			return res.status(404).end();
		}
		res.json(customer);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let customerData = Object.assign({ createdBy: userId }, req.body)
	return Customer.create(customerData)
	.then(customer => {
		if(!customer) {
			return res.status(404).end();
		}
		res.json(customer);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	let limit = 0;
	if(req.query && !isNaN(parseInt(req.query.limit))) {
		limit = parseInt(req.query.limit);
	}

	return Customer.find().sort({'createdAt': -1}).limit(limit).exec()
	.then(customer => {
		if(!customer) {
			return res.status(404).end();
		}
		res.json(customer);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let customerId = new ObjectId(req.params.id);

	Sale.findOne({ _id: customerId }).exec()
	.then(sale => {
		if (sale) {
			return res.status(400).json({ message: "Please remove Sales associated with this Customer" });
		}
		return Customer.findOne({ _id: customerId }).remove().exec()
	})
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const shippingAddress = function(req, res) {
	let psid = req.data.psid;
	console.log("Verified Signed Signature for customer: " + psid);
	Customer.findOne({ refUserId: psid }).exec().then(customer => {
		if (customer) {
			customer.address = {
				name: req.data['shipping[full-name]'],
				street_1: req.data['shipping[street_1'],
				street_2: req.data['shipping[sub-district'],
				city: req.data['shipping[district]'],
				province: 'กรุงเทพฯ',
				postalCode: req.data['shipping[postal-code]']
			}
			customer.save(function (err, customer) {
				if (err) {
					console.log(err);
					return res.sendFile(path.resolve(`${__dirname}/views/error.html`));
				}
				res.sendFile(path.resolve(`${__dirname}/views/thank-you.html`));
			});
		}
	});
}

module.exports = {
	view,
	create,
	index,
	destroy,
	shippingAddress
};
