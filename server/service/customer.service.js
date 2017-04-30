'use strict';

const request = require('request');
const config = require('../config/environment');
const Customer = require('../model/customer.model');

const createFacebookCustomer = (psid) => {

	request({
		uri: 'https://graph.facebook.com/v2.6/' + psid,
		qs: { access_token: config.PAGE_ACCESS_TOKEN, fields: "first_name,last_name,profile_pic,locale,timezone,gender" },
		method: 'GET'
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let obj = JSON.parse(body);

			let user = {
				name: obj.first_name + ' ' + obj.last_name,
				type: 'FacebookOnline',
				refUserId: psid
			};

			Customer.create(user).then(result => {
				console.log("New FacebookOnline customer created");
				console.log(result);
			}).catch(error => {
				console.log(error);
			});
		} else {
			console.error(error);
		}
	})

};

const getFacebookCustomer = (psid) => {
	return Customer.findOne({ refUserId: psid }).exec();
}

module.exports = {
	createFacebookCustomer,
	getFacebookCustomer
}
