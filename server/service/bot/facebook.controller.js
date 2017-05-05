'use strict';

const crypto = require('crypto');
const messenger = require('./messenger.facebook');
const sessionService = require('./session');
const orderService = require('../order.service');
const saleService = require('../sale.service');

/*
* Verify that the callback came from Facebook. Using the App Secret from
* the App Dashboard, we can verify the signature that is sent with each
* callback in the x-hub-signature field, located in the header.
*
* https://developers.facebook.com/docs/graph-api/webhooks#setup
*
*/
function verifyRequestSignature(req, res, buf) {
	var signature = req.headers["x-hub-signature"];

	if (!signature) {
		// For testing, let's log an error. In production, you should throw an
		// error.
		console.error("Couldn't validate the signature.");
	} else {
		var elements = signature.split('=');
		var method = elements[0];
		var signatureHash = elements[1];

		var expectedHash = crypto.createHmac('sha1', messenger.appSecret)
		.update(buf)
		.digest('hex');

		if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		}
	}
}

/*
* Use your own validation token. Check that the token used in the Webhook
* setup is the same token used here.
*
*/
const verifyWebhook = function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
	req.query['hub.verify_token'] === messenger.validationToken) {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
}

/*
* All callbacks for Messenger are POST-ed. They will be sent to the same
* webhook. Be sure to subscribe your app to your page to receive callbacks
* for your page.
* https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
*
*/
const webhook = function(req, res) {
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object == 'page') {
		// Iterate over each entry
		// There may be multiple if batched
		data.entry.forEach(function(pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			// Iterate over each messaging event
			pageEntry.messaging.forEach(function(messagingEvent) {
				if (messagingEvent.optin) {
					//receivedAuthentication(messagingEvent);
				} else if (messagingEvent.message) {
					receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					//receivedDeliveryConfirmation(messagingEvent);
				} else if (messagingEvent.postback) {
					receivedPostback(messagingEvent);
				} else if (messagingEvent.read) {
					//receivedMessageRead(messagingEvent);
				} else if (messagingEvent.account_linking) {
					//receivedAccountLink(messagingEvent);
				} else {
					console.log("Webhook received unknown messagingEvent: ", messagingEvent);
				}
			});
		});

		// Assume all went well.
		//
		// You must send back a 200, within 20 seconds, to let us know you've
		// successfully received the callback. Otherwise, the request will time out.
		res.sendStatus(200);
	}
}

/*
* Postback Event
*
* This event is called when a postback is tapped on a Structured Message.
* https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
*
*/
const receivedPostback = (event) => {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfPostback = event.timestamp;

	// The 'payload' param is a developer-defined field which is set in a postback
	// button for Structured Messages.
	var payload = event.postback.payload;

	console.log("----------------------------------------------------------------");
	console.log("Received postback for user %d and page %d with payload '%s' " +
	"at %d", senderID, recipientID, payload, timeOfPostback);
	sessionService.createSession(senderID, recipientID, timeOfPostback).then(session => {
		switch (payload) {
			case 'GET_STARTED_PAYLOAD':
			session.items = [];
			messenger.sendGreetingMessage(senderID);
			break;
			case 'PRODUCT_LIST_PAYLOAD':
			messenger.sendProductList(session);
			break;
			case 'ORDER_LIST_PAYLOAD':
			if (!session.items || session.items.length === 0) {
				messenger.sendTextMessage(senderID, "ตอนนี้ไม่มีของอยู่ในตะกร้าสินค้าครับ");
				messenger.sendMenuMessage(senderID, 500);
			}
			else {
				messenger.sendOrderList(session);
				messenger.sendShopMoreMessage(session, false, 500);
			}
			break;
			case 'CHECK_OUT_ADDRESS':
			let address = session.customer.address;
			if (session.addressConfirm) {
				// CHECK_OUT
				console.log("[Action] address is confirm, go to next step");
			}
			else if (address
			   && address.name
			   && address.street
			   && address.subDistrict
			   && address.district
			   && address.province
			   && address.postalCode
			) {
				console.log("[Action] address is not confirm, send address result");
				session.addressConfirm = false;
				messenger.sendAddressResult(session);
				break;
			}
			else {
				console.log("[Action] address is not set, send ask for address");
				messenger.sendAskForAddress(session);
				break;
			}
			case 'CONFIRM_ADDRESS':
			session.addressConfirm = true;
			case 'CHECK_OUT':
			if (session.addressConfirm) {
				if (session.items && session.items.length > 0) {
					return orderService.createOrder(session).then(order => {
						messenger.sendReceiptTemplate(session, order);
						messenger.sendPaymentMethod(session, 3000);
					});
				}
				else {
					messenger.sendTextMessage(senderID, "ตอนนี้ไม่มีของอยู่ในตะกร้าสินค้าครับ");
					messenger.sendMenuMessage(senderID, 500);
				}
			}
			else {
				messenger.sendAddressResult(session);
			}
			break;
			case 'DELETE_ALL_ORDERS':
			session.items = [];
			session.newItem = null;
			messenger.sendTextMessage(senderID, "ตอนนี้ไม่มีของอยู่ในตะกร้าสินค้าครับ");
			messenger.sendMenuMessage(senderID, 500);
			break;
			case 'CHOICE_PERSON':
			messenger.sendTextMessage(senderID, "รอสักครู่ แม่ผมจะมาตอบนะครับ");
			break;
			default:
			if (payload.startsWith('CUSTOM_')) {
				// User wants to buy
				let commands = payload.split('_');
				switch (commands[1]) {
					case 'BUY':
					if (commands.length > 3) {
						let productId = commands[2];
						let batchId = commands[3];
						console.log(`User(${senderID}) wants to buy '${productId}' batch '${batchId}' from Page(${recipientID})`);
						let ref = session.addItem(batchId, timeOfPostback);
						messenger.sendQuickReplyOrderQuantity(senderID, "รับกี่ถุงดีคร้าบ", ref);
					}
					break;
					default:
					console.log("Unknown command: " + commands[1])
				}
			}
			else {
				// When a postback is called, we'll send a message back to the sender to
				// let them know it was successful
				messenger.sendTextMessage(senderID, "Postback called");
			}
		}
	}).catch(error => {
		console.log(error);
	});

};

/*
* Message Event
*
* This event is called when a message is sent to your page. The 'message'
* object format can vary depending on the kind of message that was received.
* Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
*
* For this example, we're going to echo any text that we get. If we get some
* special keywords ('button', 'generic', 'receipt'), then we'll send back
* examples of those bubbles to illustrate the special message bubbles we've
* created. If we receive a message with an attachment (image, video, audio),
* then we'll simply confirm that we've received the attachment.
*
*/
const receivedMessage = (event) => {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("----------------------------------------------------------------");
	console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var isEcho = message.is_echo;
	var messageId = message.mid;
	var appId = message.app_id;
	var metadata = message.metadata;

	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;
	var quickReply = message.quick_reply;

	sessionService.createSession(senderID, recipientID, timeOfMessage).then(session => {
		if (isEcho) {
			// Just logging message echoes to console
			console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
			return;
		} else if (quickReply) {
			var quickReplyPayload = quickReply.payload;
			console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);

			if (quickReplyPayload.startsWith('CUSTOM_')) {
				let commands = quickReplyPayload.split('_');
				if (commands.length === 4 && commands[1] === 'Q') {
					let q = commands[2];
					let ref = commands[3];
					if (session.setNewItemQuantity(ref, q)) {
						let order = session.items.find(order => order.ref == ref);
						let sum = q * order.price / 100;
						messenger.sendTextMessage(senderID, `คุณได้สั่ง ${order.product.name} จำนวน ${q} ถุง เป็นเงิน ${sum} บาท (ref: ${ref})`);
						messenger.sendShopMoreMessage(session, true, 1000);
					}
					else {
						messenger.sendTextMessage(senderID, "ขอโทษนะคร้าบ ผมงง รบกวนเริ่มกดสั่งซื้อใหม่นะครับ");
					}
				}
			}
			else {
				messenger.sendTextMessage(senderID, "Quick reply tapped");
			}
			return;
		}

		if (messageText) {

			// If we receive a text message, check to see if it matches any special
			// keywords and send back the corresponding example. Otherwise, just echo
			// the text we received.
			switch (messageText) {

				default:
				//messenger.sendTextMessage(senderID, messageText + ' [bot]');
			}
		} else if (messageAttachments) {
			if (messageAttachments.length > 0) {
				messenger.sendTextMessage(senderID, 'ขอบคุณครับ กรุณารอตรวจสอบนะคร้าบ');
				messageAttachments.forEach(messageAttachment => {
					if (messageAttachment.type === 'image') {
						orderService.getWaitPaymentOrders(session.customer.refUserId).then(orders => {
							if (orders.length === 1) {
								// Have one waiting payment order, assume this is payment slip
								let order = orders[0];
								order.payment.status = "SLIP_PENDING";
								if (!order.payment.attachments) {
									order.payment.attachments = [];
								}
								order.payment.attachments.push(messageAttachment.payload.url);
								return order.save();
							}
						})
						// TODO: save to customer temp
					}
				});
			}
		}
	});

};

module.exports = {
	verifyRequestSignature,
	verifyWebhook,
	webhook
}
