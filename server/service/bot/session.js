'use strict';

const sessions = {};

const ProductService = require('../product.service');
const CustomerService = require('../customer.service');

function Session(senderID, recipientID, timeOfMessage) {

	let session = {
		senderID: '',
		recipientID: '',
		timeOfMessage: '',
		addItem(batchId, timestamp) {
			let ref = new Date().getTime();
			ProductService.getOnlineProducts().then(products => {
				let product = products.find(product => product.batchId == batchId);
				if (product){
					this.newItem = {
						batchId,
						price: product.price,
						product: {
							name: product.productName,
							link: product.link
						},
						ref,
						promotionId: product.promotionId,
						createdAt: timestamp
					}
				}
			});

			return ref;
		},
		setNewItemQuantity(ref, quantity, timestamp) {
			if (!this.newItem) {
				console.log("[Error] session.js No newItem");
				return false;
			}

			if (this.newItem.ref == ref) {
				this.newItem.quantity = quantity;
				this.newItem.total = this.newItem.quantity * this.newItem.price;
				this.newItem.updatedAt = timestamp;
				if (!this.items) {
					this.items = [];
				}
				this.items.push(this.newItem);
				this.newItem = null;
				return true;
			}
			else {
				console.log(`[Error] session.js Unmatched ref. ${this.newItem.ref} != ${ref}`);
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

			session.customer = customer;
			console.log(JSON.stringify(session));
			return session;
		});
	},
	getSession(senderID, recipientID) {
		let key = `${recipientID}_${senderID}`;
		return sessions[key];
	}
}
