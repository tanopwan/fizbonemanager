'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

module.exports = {
	verifyMiddleware: function(req, res, next) {

		var token = req.headers['x-access-token'];
		if (token) {

			jwt.verify(token, config.jwt, function(err, decoded) {
				if (err) {
					return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});

		} else {
			// if there is no token
			// return an error
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	},
	sign: function(content) {
		return jwt.sign(content, config.jwt, {
			expiresIn: 1440 // expires in 24 hours
		});
	},
	hasRoleAdmin: function(req, res, next) {
		var role = req.decoded._doc.role;
		if (role === 'admin') {
			next();
			return;
		}
		else {
			return res.status(401).send({
				success: false,
				message: 'Not Allowed'
			});
		}
	}
}
