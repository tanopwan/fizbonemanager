'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../api/user/user.model');

module.exports = {
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
						return res.status(401).send({
							success: false,
							message: 'User is not registered.'
						});
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
