'use strict';

const Consignment = require('./consignment.model');
const Sale = require('../sale/sale.model');
const config = require('../../config/environment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function(req, res) {
	let consignmentId = req.params.id;

	return Consignment.findOne({ _id: consignmentId }).exec()
	.then(consignment => {
		if(!consignment) {
			return res.status(404).end();
		}
		res.json(consignment);
	})
	.catch(err => res.status(500).json(err));
}

const create = function(req, res) {
	let userId = new ObjectId(req.decoded._doc._id);

	let consignmentData = Object.assign({ createdBy: userId }, req.body)
	return Consignment.create(consignmentData)
	.then(consignment => {
		if(!consignment) {
			return res.status(404).end();
		}
		res.json(consignment);
	})
	.catch(err => res.status(500).json(err));
}

const index = function(req, res) {
	let limit = 0;
	if(req.query && !isNaN(parseInt(req.query.limit))) {
		limit = parseInt(req.query.limit);
	}
	
	return Consignment.find({ isDeleted: false }).sort({'saleDate': -1}).limit(limit).populate('promotionId').exec()
	.then(consignment => {
		if(!consignment) {
			return res.status(404).end();
		}
		res.json(consignment);
	})
	.catch(err => res.status(500).json(err));
}

const destroy = function(req, res) {
	let consignmentId = new ObjectId(req.params.id);

	Sale.findOne({ consignmentId }).exec()
	.then(sale => {
		if (sale) {
			return res.status(400).json({ message: "Please remove Sales associated with this Consignment" });
		}
		return Consignment.findOne({ _id: consignmentId }).remove().exec()
	})
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

const setIsActive = function(req, res) {
	let consignmentId = new ObjectId(req.params.id);
	let isActive = req.params.isActive;

	return Promotion.findOneAndUpdate({ _id: consignmentId }, { $set: { isActive: isActive }}).exec()
	.then(result => {
		res.json(result);
	})
	.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	index,
	destroy,
	setIsActive
};
