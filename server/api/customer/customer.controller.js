'use strict';

const messenger = require('../../service/bot/fbmessenger.service');
const CustomerService = require('../../service/customer.service');
const sessionManager = require('../../service/bot/session');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let customerId = req.params.id;

	return CustomerService.getCustomer(customerId)
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

	let customerData = Object.assign({ createdBy: userId }, req.body);
	return CustomerService.createCustomer(customerData)
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

	return CustomerService.getCustomers(limit)
	.then(customers => {
		if(!customers) {
			return res.status(404).end();
		}
		res.json(customers);
	})
	.catch(err => res.status(500).json(err));
}

const shippingAddress = function(req, res) {
	let psid = req.data.psid;
	let page_id = req.data.page_id;
	console.log("Verified Signed Signature for customer: " + psid);
	CustomerService.setShippingAddress(psid, req.body).then(customer => {
		let session = sessionManager.getSession(psid, page_id);
		if (session) {
			session.customer = customer;
			messenger.sendAddressResult(session);
			res.status(200).json("{}");
		}
		else {
			messenger.sendTextMessage(psid, "เกิดข้อผิดพลาด กรุณาทำรายการใหม่ (อาจจะเป็นเพราะรอนานเกินไปค้าบ)");
			res.status(500).json({});
		}

	}).catch(err => {
		messenger.sendTextMessage(psid, err);
		res.status(500).json({});
	});
}

module.exports = {
	view,
	create,
	index,
	shippingAddress
};
