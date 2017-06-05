'use strict';

const Sale = require('../model/sale.model');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	saleData.isDeleted = false;

	return Sale.create(saleData);
};

const getSales = (limit, group) => {
	if(!isNaN(parseInt(limit))) {
		limit = parseInt(limit);
	}
	else {
		limit = 0;
	}

	let criteria = {
		isDeleted: false
	};

	if (group) {
		criteria['promotion.group'] = group;
	}

	return Sale.find(criteria).sort({'createdAt': -1}).limit(limit).exec();
};

module.exports = {
	createSale,
	getSales
};
