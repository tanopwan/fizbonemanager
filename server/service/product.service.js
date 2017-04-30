'use strict';

const Product = require('../model/product.model');
const Promotion = require('../api/promotion/promotion.model');

let cacheOnlineProducts = null;
const promiseOnlineProducts = Promotion.aggregate([
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
			link: { $first: '$product.link' },
			price: { $first: '$price' }
		}
	}
]).exec().then(resolve => {
	cacheOnlineProducts = resolve;
});

const getOnlineProducts = () => {
	if (cacheOnlineProducts) {
		return Promise.resolve(cacheOnlineProducts);
	}
	else {
		return promiseOnlineProducts;
	}
}

module.exports = {
	getOnlineProducts
}