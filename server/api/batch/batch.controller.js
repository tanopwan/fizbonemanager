'use strict';

const Batch = require('../../model/batch.model');
const Promotion = require('../../model/promotion.model');
const Sale = require('../../model/sale.model');
const batchService = require('../../service/batch.service');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const view = function (req, res) {
	let batchId = req.params.id;

	return Batch.findOne({ _id: batchId }).exec()
		.then(batch => {
			if (!batch) {
				return res.status(404).end();
			}
			res.json(batch);
		})
		.catch(err => res.status(500).json(err));
}

const create = function (req, res) {
	let userId = new ObjectId(req.user._id);

	let batchData = Object.assign({ createdBy: userId }, req.body);
	return Batch.create(batchData)
		.then(batch => {
			if (!batch) {
				return res.status(404).end();
			}
			res.status = 201;
			res.json(batch);
		})
		.catch(err => res.status(500).json(err));
}

const update = function (req, res) {
	let userId = new ObjectId(req.user._id);
	let batchId = new ObjectId(req.params.id);
	let batchData = Object.assign({ createdBy: userId }, req.body);
	return Batch.replaceOne({ _id: batchId }, batchData)
		.then(result => {
			return Batch.findOne({ _id: batchId });
		})
		.then(batch => {
			if (!batch) {
				return res.status(404).end();
			}
			res.status = 201;
			res.json(batch);
		})
		.catch(err => res.status(500).json(err));
}

const index = function (req, res) {
	return Batch.find().exec()
		.then(batch => {
			if (!batch) {
				return res.status(404).end();
			}
			res.json(batch);
		})
		.catch(err => res.status(500).json(err));
}

const destroy = function (req, res) {
	let batchId = new ObjectId(req.params.id);

	Promotion.findOne({ batchId }).exec()
		.then(promotion => {
			if (promotion) {
				return res.status(400).json({ message: "Please remove Promotions associated with this Batch" });
			}
			return Batch.findOne({ _id: batchId }).remove().exec()
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

const stock = function (req, res) {
	Sale.aggregate([
		{ $sort: { saleDate: 1 } },
		{
			$lookup: {
				"from": "batches",
				"localField": "batch.batchId",
				"foreignField": "_id",
				"as": "batchId"
			}
		},
		{
			$unwind: '$batchId'
		},
		{
			$group: {
				_id: '$batch.batchId',
				productName: { $first: '$product.name' },
				batchName: { $first: '$batch.batchRef' },
				totalQuantity: { $sum: '$quantity' },
				transaction: { $sum: 1 },
				totalStock: { $first: '$batchId.quantity' },
				deliveries: {
					$sum: {
						$cond: [
							{
								$eq: ["$promotion.isNeedDelivery", false]
							},
							0,
							1
						]
					}
				},
				sales: {
					$push: {
						saleDate: "$saleDate",
						quantity: "$quantity",
					}
				}
			}
		}
	]).exec()
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

const stockById = function (req, res) {
	let batchId = new ObjectId(req.params.id);

	Sale.aggregate(
		{
			$match: {
				'batch.batchId': { $eq: batchId }
			}
		},
		{
			$lookup: {
				"from": "batches",
				"localField": "batch.batchId",
				"foreignField": "_id",
				"as": "batchId"
			}
		},
		{
			$unwind: '$batchId'
		},
		{
			$group: {
				_id: '$promotion.group',
				promotionName: { $first: '$promotion.name' },
				promotionGroup: { $first: '$promotion.group' },
				totalQuantity: { $sum: '$quantity' },
				transaction: { $sum: 1 },
				totalStock: { $first: '$batchId.quantity' },
				deliveries: {
					$sum: {
						$cond: [
							{
								$eq: ["$promotion.isNeedDelivery", false]
							},
							0,
							1
						]
					}
				},
			}
		}
	).exec()
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

const setIsFinish = function (req, res) {
	let objectId = new ObjectId(req.params.id);
	let isFinish = req.params.isFinish;

	return Batch.findOneAndUpdate({ _id: objectId }, { $set: { isFinish: isFinish } }).exec()
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

const subscribeStock = function (req, res) {
	let connectionId = guid();
	console.log("subscription stock open", connectionId);
	// set timeout as high as possible
	req.socket.setTimeout(Number.MAX_VALUE);

	// send headers for event-stream connection
	// see spec for more information
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');

	// push this res object to our global variable
	global.openConnections.push(res);

	// When the request is closed, e.g. the browser window
	// is closed. We search through the open connections
	// array and remove this connection.
	req.on("close", function () {
		var toRemove;
		for (var j = 0; j < global.openConnections.length; j++) {
			if (global.openConnections[j] == res) {
				toRemove = j;
				break;
			}
		}
		global.openConnections.splice(j, 1);
		console.log("subscription stock close", connectionId, "remaining:", global.openConnections.length);
	});

	batchService.getRealtimeStock().then(result => {
		// Write first request
		global.openConnections.forEach(function (resp) {
			var d = new Date();
			resp.write('id: ' + d.getMilliseconds() + '\n');
			resp.write('data:' + JSON.stringify(result) + '\n\n'); // Note the extra newline
		});
	});

}

// setInterval(function () {
// 	// we walk through each connection
// 	global.openConnections.forEach(function (resp) {
// 		var d = new Date();
// 		resp.write('id: ' + d.getMilliseconds() + '\n');
// 		resp.write('data:' + 'test' + '\n\n'); // Note the extra newline
// 	});

// }, 1000);

const realtimeStock = (req, res) => {
	return batchService.getRealtimeStock()
		.then(result => {
			res.json(result);
		})
		.catch(err => res.status(500).json(err));
}

module.exports = {
	view,
	create,
	update,
	index,
	destroy,
	stock,
	stockById,
	setIsFinish,
	subscribeStock,
	realtimeStock,
};
