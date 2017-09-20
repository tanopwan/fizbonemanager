'use strict';

const Batch = require('../model/batch.model');
const Sale = require('../model/sale.model');

const getBatch = (batchId) => {
	return Batch.findOne({ _id: batchId }).exec();
}

const getRealtimeStock = () => {
	return Sale.aggregate([
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
				product: { $first: '$product' },
				batch: { $first: '$batch' },
				used: { $sum: '$quantity' },
				total: { $first: '$batchId.quantity' },
			}
		}
	]).exec();
}

const setIsFinish = (id, isFinish) => {
	return Batch.findOneAndUpdate({ _id: id }, { $set: { isFinish: isFinish } }).exec();
}

module.exports = {
	getBatch,
	getRealtimeStock,
	setIsFinish,
}
