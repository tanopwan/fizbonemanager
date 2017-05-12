'use strict';

const Sale = require('../model/sale.model');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	saleData.isDeleted = false;

	return Sale.create(saleData);
};

const getSales = (limit, isConsignment) => {
	if(!isNaN(parseInt(limit))) {
		limit = parseInt(limit);
	}
	else {
		limit = 0;
	}

	let consignment = null;
	if (!isConsignment) {
		consignment = { $in: [null, false, true] };
	}
	else if (isConsignment.toLowerCase() === 'true') {
		consignment = true;
	}
	else {
		consignment = { $in: [null, false] };
	}

	return Sale.find({ isDeleted: false, isConsignment: consignment }).sort({'createdAt': -1}).limit(limit).exec();
};

module.exports = {
	createSale,
	getSales
};
