'use strict';

const Sale = require('../model/sale.model');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	saleData.isDeleted = false;

	return Sale.create(saleData);
};

module.exports = {
	createSale
};
