'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../api/user/user.model');
const base64url = require('base64-url');
const crypto = require('crypto');
const path = require('path');

module.exports = {
	verifyMessengerExtenstion: function(req, res, next) {
		let signedRequest = req.get('Authorization').split(' ')[1];
		if (signedRequest) {
			let signedData = signedRequest.split('.');
			let encoded_sig = signedData[0];
			let payload = signedData[1];
			let sig = base64url.decode(encoded_sig);
			let data = base64url.decode(payload);
			const hmac = crypto.createHmac('sha256', config.PAGE_SECRET);
			hmac.update(payload);
			let expectedSig = hmac.digest('hex');

			if (sig === expectedSig) {
				req.data = JSON.parse(data);
				next();
			}
			else {
				res.sendFile(path.resolve(`${__dirname}/../views/error.html`));
			}
		}
		else {
			res.sendFile(path.resolve(`${__dirname}/../views/error.html`));
		}
	},
	verifyMiddleware: function(req, res, next) {
		var token = req.headers['x-access-token'];
		if (token) {

			jwt.verify(token, config.jwt, function(err, decoded) {
				if (err) {
					return res.status(401).send({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					let user = decoded._doc;
					return User.findOne({ _id: user._id }).exec().then(result => {
						if (result) {
							req.user = result;
							return next();
						}
						else {
							return res.status(401).send({
								success: false,
								message: 'User is not registered.'
							});
						}
					})
				}
			});

		} else {
			// if there is no token
			// return an error
			return res.status(401).send({
				success: false,
				message: 'No token provided.'
			});
		}
	},
	sign: function(content) {
		return jwt.sign(content, config.jwt, {
			expiresIn: '1d' // expires in 24 hours
		});
	},
	hasRoleAdmin: function(req, res, next) {
		var role = req.decoded._doc.role;
		if (role === 'admin') {
			next();
			return;
		}
		else {
			return res.status(403).send({
				success: false,
				message: 'Not Allowed, Admin only'
			});
		}
	}
}
