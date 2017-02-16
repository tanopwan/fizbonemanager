'use strict';

const User = require('./user.model');
const config = require('../../config/environment');

const me = function(req, res) {
	let userId = req.decoded._doc._id;

	return User.findOne({ _id: userId }).exec()
	.then(user => {
		if(!user) {
			return res.status(401).end();
		}
		res.json(user);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return User.find().exec()
	.then(user => {
		if(!user) {
			return res.status(401).end();
		}
		res.json(user);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	return User.findOne({ _id: userId }).remove().exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const show = function(req, res) {
	let userId = req.params.id;

	return User.findOne({ _id: userId }, { kycInfo: 0 }).exec()
	.then(user => {
		if(!user) {
			return res.status(404).end();
		}
		res.json(user);
	})
	.catch(err => res.status(500).json(err));
}

const logout = function(req, res) {
	res.clearCookie(config.cookieName, { path:'/' });
	res.redirect('/');
}

module.exports = {
	me,
	index,
	destroy,
	show,
	logout
};
