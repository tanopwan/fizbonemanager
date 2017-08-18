'use strict';

const request = require('request');
const config = require('../config/environment');
const Customer = require('../model/customer.model');
const crypto = require('crypto');
const https = require('https');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const createFacebookCustomer = (psid) => {
	return request({
		uri: 'https://graph.facebook.com/v2.6/' + psid,
		qs: { access_token: config.PAGE_ACCESS_TOKEN, fields: "first_name,last_name,profile_pic,locale,timezone,gender" },
		method: 'GET'
	}, function (error, response, body) {
		console.log(response);
		if (!error && response.statusCode == 200) {
			let obj = JSON.parse(body);

			let customer = {
				name: obj.first_name + ' ' + obj.last_name,
				type: 'FacebookOnline',
				refUserId: psid,
				ref: obj,
				fb: {
					psid,
				}
			};

			console.log(customer);

			return Customer.create(customer);
		} else {
			console.error("[Customer Service]", error);
		}
	});
};

const getFacebookCustomer = (psid) => {
	console.log("getFBCustomer", psid);
	return Customer.findOne({ refUserId: psid }).exec();
};

const getCustomer = (id) => {
	return Customer.findOne({ _id: id }).exec();
};

const getCustomers = (limit) => {
	return Customer.find().sort({ 'createdAt': -1 }).limit(limit).exec();
};

const createCustomer = (customerData) => {
	return Customer.create(customerData);
}

const updateCustomer = (customerId, customerData) => {
	return Customer.replaceOne({ _id: customerId }, customerData).then(result => {
		return Customer.findOne({ _id: customerId });
	})
}

const deleteCustomer = (customerId) => {
	return Customer.findOne({ _id: customerId }).remove().exec();
}

const setShippingAddress = (psid, address) => {
	return Customer.findOne({ refUserId: psid }).exec().then(customer => {
		if (customer) {
			customer.address = {
				name: address.name,
				street: address.street,
				subDistrict: address.subDistrict,
				district: address.district,
				province: 'กรุงเทพฯ', //TODO
				postalCode: address.postalCode
			}
			console.log("Saving customer address " + customer);
			return customer.save();
		}
	});
};

const getCustomerFromConversationParticipantId = (participantId) => {
	return Customer.findOne({ 'fb.participantId': participantId }).exec();
}

module.exports = {
	createFacebookCustomer,
	getFacebookCustomer,
	setShippingAddress,
	getCustomer,
	getCustomers,
	createCustomer,
	updateCustomer,
	deleteCustomer,
	getCustomerFromConversationParticipantId,
}
