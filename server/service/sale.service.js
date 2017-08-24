'use strict';

const Sale = require('../model/sale.model');
const moment = require('moment');
const batchService = require('./batch.service');

const createSale = (saleData, userId) => {
	saleData.createdBy = userId;
	return Sale.create(saleData).then(result => {
		batchService.getRealtimeStock().then(result => {
			// Write first request
			global.openConnections.forEach(function (resp) {
				var d = new Date();
				resp.write('id: ' + d.getMilliseconds() + '\n');
				resp.write('data:' + JSON.stringify(result) + '\n\n'); // Note the extra newline
			});
		});
		return Promise.resolve(result);
	});
};

const updateSale = (saleData, saleId) => {
	return Sale.replaceOne({ _id: saleId }, saleData).then(result => {
		batchService.getRealtimeStock().then(result => {
			// Write first request
			global.openConnections.forEach(function (resp) {
				var d = new Date();
				resp.write('id: ' + d.getMilliseconds() + '\n');
				resp.write('data:' + JSON.stringify(result) + '\n\n'); // Note the extra newline
			});
		});
		return Sale.findOne({ _id: saleId });
	});
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
