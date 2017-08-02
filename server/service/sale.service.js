'use strict';

const Sale = require('../model/sale.model');
const moment = require('moment');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	return Sale.create(saleData);
};

const updateSale = (saleData, saleId) => {
	console.log(saleData);
	return Sale.findOneAndUpdate({ _id: saleId }, saleData, {new: true});
};

const createSaleIntention = (saleIntention) => {
	let data = {
		quantity: saleIntention.quantity,
		description: "",
		saleDate: moment(),
		product: {
			name: saleIntention.product.name,
		},
		batch: {
			batchId: saleIntention.promotion.batch.batchId,
			batchRef: saleIntention.promotion.batch.batchRef,
		},
		promotion: {
			name: saleIntention.promotion.name,
			price: saleIntention.promotion.price,
			group: saleIntention.promotion.group,
		},
		tags: saleIntention.tags,
	}

	if (saleIntention.promotion.group !== "Consignment") {
		data.bill = {
			bills: {
				quantity: saleIntention.quantity,
				price: saleIntention.promotion.price,
				date: moment(),
			},
			total: saleIntention.quantity * saleIntention.promotion.price,
		}
	}

	return Sale.create(data);
}

const getSales = (params) => {
	if(!isNaN(parseInt(params.limit))) {
		params.limit = parseInt(params.limit);
	}
	else {
		params.limit = 0;
	}

	if(!isNaN(parseInt(params.offset))) {
		params.offset = parseInt(params.offset);
	}
	else {
		params.offset = 0;
	}

	let criteria = {};

	if (params.group) {
		criteria['promotion.group'] = { $regex : new RegExp(params.group, "i") };
	}

	if (params.customer) {
		criteria['customer.name'] = params.customer;
	}

	if (params.from || params.to) {
		criteria['saleDate'] = {
			$gte: params.from,
			$lte: params.to
		}
	}

	if (params.includeBilledSales == "false") {
		criteria['$where'] = function() {
			if (!this.bill) {
				return true;
			}

			return this.quantity > this.bill.quantity;
		}
	}

	if (params.batchId) {
		criteria['batch.batchId'] = params.batchId;
	}

	let count = 0;
	return Sale.count(criteria).then(response => {
		count = response;
		return Sale.find(criteria).sort({'saleDate': -1}).limit(params.limit).skip(params.offset).exec();
	}).then(sales => {
		return {
			total: count,
			sales
		}
	});

};

module.exports = {
	createSale,
	updateSale,
	getSales,
	createSaleIntention,
};
