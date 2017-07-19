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
		$group: {
			_id: '$product.name',
			link: { $first: '$product.link' },
			price: { $first: '$price' },
			batchId: { $first: '$batch.batchId' },
			batchRef: { $first: '$batch.batchRef' },
			promotionId: { $first: '$_id' },
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

const getProduct = (productId) => {
	return Product.findOne({ _id: productId }).exec();
}

const getProducts = () => {
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
