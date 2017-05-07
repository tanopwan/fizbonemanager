'use strict';

const Product = require('../model/product.model');
const Promotion = require('../model/promotion.model');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
			price: { $first: '$price' },
			batchId: { $first: '$batch._id' },
			promotionId: { $first: '$_id' },
		}
	}
]).exec().then(resolve => {
	cacheOnlineProducts = resolve;
	console.log(cacheOnlineProducts);
});

const getOnlineProducts = () => {
	if (cacheOnlineProducts) {
		return Promise.resolve(cacheOnlineProducts);
	}
	else {
		return promiseOnlineProducts;
	}
}

const getProduct = (productId) => {
	return Product.findOne({ _id: productId }).exec();
}

const getProducts = (productId) => {
	return Product.find().exec();
}

const createProduct = (data, userId) => {
	let createdBy = new ObjectId(userId);
	let productData = Object.assign({ createdBy }, data);

	return Product.create(productData);
}

module.exports = {
	getOnlineProducts,
	getProduct,
	getProducts,
	createProduct
}
