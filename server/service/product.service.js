'use strict';

const Product = require('../model/product.model');
const Promotion = require('../api/promotion/promotion.model');

const getOnlineProducts = () => {
	return Promotion.aggregate([
		{ $match: { group: { $eq: 'Online' } } },
		{ $sort : { createdAt : -1 } },
		{
			$lookup: {
		        "from": "batches",
		        "localField": "batchId",
		        "foreignField": "_id",
		        "as": "batch"
		    }
		},
		{
			$unwind: '$batch'
		},
		{
			$lookup: {
		        "from": "products",
		        "localField": "batch.productId",
		        "foreignField": "_id",
		        "as": "product"
		    }
		},
		{
			$unwind: '$product'
		},
		{
			$group: {
				_id: '$product._id',
				productName: { $first: '$product.name' },
				price: { $first: '$price' }
			}
		}
	]).exec();
}

module.exports = {
	getOnlineProducts
}
