'use strict';

const Order = require('../model/order.model');
const Sale = require('../model/sale.model');
const batchService = require('./batch.service');

const createOrder = (data) => {
	let sales = [];
	let orderId = '';
	let total = 0;
	data.saleItems.forEach(saleItem => {
		total += saleItem.quantity;
	});
	data.total = total;
	return Order.create(data).then(order => {
		orderId = order._id;
		data.saleItems.forEach(saleItem => {
			saleItem.saleDate = order.saleDate;
			saleItem.orderId = order._id;
			let sale = new Sale(saleItem);
			sales.push(sale);
		});

		return Sale.insertMany(sales);
	}).then(sales => {
		batchService.getRealtimeStock().then(result => {
			// Write first request
			global.openConnections.forEach(function (resp) {
				var d = new Date();
				resp.write('id: ' + d.getMilliseconds() + '\n');
				resp.write('data:' + JSON.stringify(result) + '\n\n'); // Note the extra newline
			});

			result.forEach(batch => {
				if (batch.used === batch.total) {
					console.log(batch.batchId + " is Finish!");
					batchService.setIsFinish(batch.batchId, true);
				}
			})
		});

		return Order.findOne(orderId).exec().then(order => {
			return Promise.resolve(order);
		})
	})
}

const createOrderFromSession = (session, shippingFee) => {

	if (!session || !session.customer.address) {
		return Promise.reject({});
	}

	if (!shippingFee) {
		shippingFee = 0;
	}

	let orderData = {
		subTotal: 0,
		shippingFee,
		total: 0,
		status: 'OPEN'
	};
	orderData.items = session.items;
	orderData.address = session.customer.address;
	orderData.shipping = {
		status: "WAIT_VERIFIED",
		type: "EMS"
	};
	orderData.payment = {
		status: "WAIT",
		method: "BANK_TRANSFER"
	};
	session.items.forEach(item => {
		orderData.subTotal += item.total;
	});
	orderData.total = orderData.subTotal + orderData.shippingFee;
	orderData.customer = {
		name: session.customer.name,
		refUserId: session.customer.refUserId,
		type: session.customer.type
	};
	console.log("[Action] create order: " + JSON.stringify(orderData));
	return Order.create(orderData);
};

const getOrders = (params) => {
  let criteria = {};

  if (params.from || params.to) {
		criteria['saleDate'] = {
			$gte: params.from,
			$lte: params.to
		}
  }
  console.log(criteria);
	return Order.find(criteria).sort({'saleDate': -1}).limit(params.limit).skip(params.offset).exec();
}

const getOrder = (orderId) => {
	return Order.findOne({ _id: orderId }).exec().then(order => {
		return Sale.find({ orderId: order._id }).exec().then(sales => {
			return Promise.resolve(Object.assign({}, order.toObject(), { items: sales }));
		});
	})
}

const getWaitPaymentOrders = (refUserId) => {
	return Order.find({ 'customer.refUserId': refUserId, 'payment.status': 'WAIT', 'payment.method': 'BANK_TRANSFER' }).exec();
}

const deleteOrder = function(orderId) {

	return Sale.find({ orderId }).exec().then(sales => {
		if (sales && sales.length > 0) {
			return Promise.reject({ message: "Please delete sales " + sales.map(sale => sale._id).join(",") });
		}
		return Order.findOne({ _id: orderId }).remove().exec();
	});
}

module.exports = {
	createOrder,
	getOrders,
	getOrder,
	getWaitPaymentOrders,
	createOrderFromSession,
	deleteOrder,
}
