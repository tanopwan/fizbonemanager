'use strict';

const User = require('./user.model');
const config = require('../../config/environment');
const PageService = require('../../service/page.service');

const me = function (req, res) {
	let userId = req.user._id;

	return User.findOne({ _id: userId }).exec()
		.then(user => {
			if (!user) {
				return res.status(500).end();
			}
			res.json(user);
		})
		.catch(err => res.status(500).json(err));
}

const page = function (req, res) {
	return PageService.getPage(req, res);
}

const index = function (req, res) {
	return User.find().exec()
		.then(user => {
			if (!user) {
				return res.status(500).end();
			}
			res.json(user);
		})
		.catch(err => res.status(500).json(err));
}

const destroy = function (req, res) {
	return User.findOne({ _id: userId }).remove().exec()
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

const show = function (req, res) {
	let userId = req.params.id;

	return User.findOne({ _id: userId }, { kycInfo: 0 }).exec()
		.then(user => {
			if (!user) {
				return res.status(404).end();
			}
			res.json(user);
		})
		.catch(err => res.status(500).json(err));
}

const profile = function (req, res) {
	let me = req.user._id;
	let body = req.body;

	console.log(me);
	console.log(body);

	res.json({});
}

const logout = function (req, res) {
	res.clearCookie('jwt-app', { path: '/' });
	res.redirect('/');
}

module.exports = {
	me,
	index,
	destroy,
	show,
	logout,
	profile,
	page,
};
