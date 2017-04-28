'use strict';

const sessions = {};
const ProductService = require('../product.service');

const SESSION = {
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
		})

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
	}
}

function Session(senderID, recipientID, timeOfMessage) {
	let session = Object.assign({}, SESSION);
	session.senderID = senderID;
	session.recipientID = recipientID;
	session.timeOfMessage = timeOfMessage;
	return session;
}

module.exports = {
	createSession(senderID, recipientID, timeOfMessage) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions[key];
		if (!session) {
			console.log("Create new session with key: " + key);
			session = new Session(senderID, recipientID, timeOfMessage);
			sessions[key] = session;
		}
		else {
			console.log("User session exists with key: " + key);
		}
		console.log(sessions);
		return session;
	},
	getSession(senderID, recipientID) {
		let key = `${recipientID}_${senderID}`;
		return sessions[key];
	},
	setState(senderID, recipientID, newState) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions[key];
		if (session) {
			session.state = newState;
		}
	},
	addOrder(senderID, recipientID, item) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions[key];
		if (session) {
			session["orders"].push(item);
		}
	}
}
