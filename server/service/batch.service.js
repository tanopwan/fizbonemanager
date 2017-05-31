'use strict';

const Batch = require('../model/batch.model');

const getBatch = (batchId) => {
	return Batch.findOne({ _id: batchId }).exec();
}

module.exports = {
	getBatch
}
