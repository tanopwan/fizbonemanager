'use strict';

const Sale = require('../model/sale.model');

const createSale = (saleData) => {
	if (!saleData) {
		return Promise.reject({});
	}

	saleData.isDeleted = false;
	return Sale.create(saleData);
};

module.exports = {
	createSale
};
