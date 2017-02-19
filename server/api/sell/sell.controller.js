'use strict';

const Item = require('./item.model');
const config = require('../../config/environment');

const view = function(req, res) {
	let itemId = req.params.id;

	return Item.findOne({ _id: itemId }).exec()
	.then(item => {
		if(!item) {
			return res.status(404).end();
		}
		res.json(item);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let itemData = Object.assign({ createdBy: userId }, {req.data})
	return Item.create(itemData).exec()
	.then(item => {
		if(!item) {
			return res.status(401).end();
		}
		res.json(item);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	return Item.find().exec()
	.then(item => {
		if(!item) {
			return res.status(401).end();
		}
		res.json(item);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	return Item.findOne({ _id: itemId }).remove().exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	index,
	destroy
};
