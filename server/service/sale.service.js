'use strict';

const Sale = require('../model/sale.model');
const moment = require('moment');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	console.log(saleData);
	return Sale.create(saleData);
};

const getSales = (limit, group, range) => {
	if(!isNaN(parseInt(limit))) {
		limit = parseInt(limit);
	}
	else {
		limit = 0;
	}

	let criteria = {
		isDeleted: { $in: [false, null] }
	};

	if (group) {
		criteria['promotion.group'] = group;
	}

	if (range === 'today') {
		var today = moment().startOf('day')
		var tomorrow = moment(today).add(1, 'days')
		criteria['saleDate'] = {
			$gte: today.toDate(),
			$lt: tomorrow.toDate()
		}
	}

	return Sale.find(criteria).sort({'createdAt': -1}).limit(limit).exec();
};

module.exports = {
	createSale,
	getSales
};
