'use strict';

const Order = require('../model/order.model');

const createOrder = (session, shippingFee) => {

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
		orderData.subTotal += item.total / 100;
	});
	orderData.total = orderData.subTotal + orderData.shippingFee;
	orderData.customer = {
		name: session.customer.name,
		refUserId: session.customer.refUserId
	};
	console.log("[Action] create order: " + JSON.stringify(orderData));
	return Order.create(orderData);
};

module.exports = {
	createOrder
}
