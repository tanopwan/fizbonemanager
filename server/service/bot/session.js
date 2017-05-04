'use strict';

const sessions = {};

const ProductService = require('../product.service');
const CustomerService = require('../customer.service');

function Session(senderID, recipientID, timeOfMessage) {

	let session = {
		senderID: '',
		recipientID: '',
		timeOfMessage: '',
		addItem(productId, timestamp) {
			let ref = new Date().getTime();
			ProductService.getOnlineProducts().then(products => {
				let product = products.find(product => product._id == productId);
				if (product){
					this.newItem = {
						productId,
						productName: product.productName,
						price: product.price,
						link: product.link,
						ref,
						createdAt: timestamp
					}
				}
			});

			return ref;
		},
		setNewItemQuantity(ref, q, timestamp) {
			if (!this.newItem) {
				return false;
			}

			if (!this.newItem.productId) {
				// reset newItem data
				this.newItem = null;
				return false;
			}

			if (this.newItem.ref == ref) {
				this.newItem.q = q;
				this.newItem.updatedAt = timestamp;
				if (!this.orders) {
					this.orders = [];
				}
				this.orders.push(this.newItem);
				this.newItem = null;
				return true;
			}
			else {
				console.log(`[Error] Unmatched ref. ${this.newItem.ref} != ${ref}`);
				return false;
			}
		},
	};
	session.senderID = senderID;
	session.recipientID = recipientID;
	session.timeOfMessage = timeOfMessage;

	return session;
}

module.exports = {
	createSession(senderID, recipientID, timeOfMessage) {
		console.log("Create new Session for customer psid: " + senderID);
		return CustomerService.getFacebookCustomer(senderID).then(customer => {
			if (!customer) {
				console.log("session.js - New customer");
				return CustomerService.createFacebookCustomer(senderID);
			}
			else {
				console.log("session.js - Existing customer");
				return Promise.resolve(customer);
			}
		}).then(customer => {
			console.log("resolve " + customer);

			let key = `${recipientID}_${senderID}`;
			let session = sessions[key];
			if (!session) {
				console.log("Create new session with key: " + key);
				session = new Session(senderID, recipientID, timeOfMessage);
				sessions[key] = session;
			}
			else {
				console.log("Customer session exists with key: " + key);
			}

			if (customer.address) {
				session.address = {
					name: customer.address.name,
					street_1: customer.address.street,
					street_2: customer.address.subDistrict,
					city: customer.address.district,
					state: customer.address.province,
					postal_code: customer.address.postalCode,
					country: "ประเทศไทย"
				}
			}
			
			console.log(JSON.stringify(session));
			return session;
		});
	},
	getSession(senderID, recipientID) {
		let key = `${recipientID}_${senderID}`;
		return sessions[key];
	},
	addOrder(senderID, recipientID, item) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions[key];
		if (session) {
			session["orders"].push(item);
		}
	}
}
