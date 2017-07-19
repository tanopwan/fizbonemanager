'use strict';

const Order = require('../model/order.model');

const createOrder = (data) => {
	
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

const getOrders = () => {
	return Order.find().exec();
}

const getWaitPaymentOrders = (refUserId) => {
	return Order.find({ 'customer.refUserId': refUserId, 'payment.status': 'WAIT', 'payment.method': 'BANK_TRANSFER' }).exec();
}

module.exports = {
	createOrder,
	getOrders,
	getWaitPaymentOrders,
	createOrderFromSession
}
