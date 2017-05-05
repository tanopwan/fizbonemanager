'use strict';

const Customer = require('../../model/customer.model');
const Sale = require('../sale/sale.model');
const messenger = require('../../service/bot/messenger.facebook');
const CustomerService = require('../../service/customer.service');
const sessionManager = require('../../service/bot/session');

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
	let page_id = req.data.page_id;
	console.log("Verified Signed Signature for customer: " + psid);
	CustomerService.setShippingAddress(psid, req.body).then(customer => {
		let address = customer.address;
		console.log(address);
		let session = sessionManager.getSession(psid, page_id);
		if (session) {
			session.address = {
				name: address.name,
				street_1: address.street,
				street_2: address.subDistrict,
				city: address.district,
				state: address.province,
				postal_code: address.postalCode,
				country: "ประเทศไทย"
			}
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
	})
	/*Customer.findOne({ refUserId: psid }).exec().then(customer => {
		if (customer) {
			console.log(req.body);
			customer.address = {
				name: req.body.name,
				street: req.body.street,
				subDistrict: req.body.subDistrict,
				district: req.body.district,
				province: 'กรุงเทพฯ', //TODO
				postalCode: req.body.postalCode
			}
			console.log("Saving customer address: " + customer);
			customer.save(function (err, customer) {
				if (err) {
					console.log(err);
					return res.status(500).json(err);
				}
				res.status(200).json("{}");
				messenger.sendTextMessage(psid, "ขอบคุณสำหรับข้อมูลคร้าบ");
				let session = sessionManager.getSession(psid, page_id);
				if (session) {
					session.address = {
						name: customer.address.name,
						street_1: customer.address.street,
						street_2: customer.address.subDistrict,
						city: customer.address.district,
						state: customer.address.province,
						postal_code: customer.address.postalCode,
						country: "ประเทศไทย"
					}
					session.rec
					messenger.sendAddressResult(session);
				}
				else {
					messenger.sendTextMessage(psid, "เกิดข้อผิดพลาด กรุณาทำรายการใหม่ (อาจจะเป็นเพราะรอนานเกินไปค้าบ)");
				}
			});
		}
		else {
			res.status(500).json(err);
		}
	});*/
}

module.exports = {
	view,
	create,
	index,
	destroy,
	shippingAddress
};
