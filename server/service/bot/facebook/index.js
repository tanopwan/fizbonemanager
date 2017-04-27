'use strict';

const messenger = require('./message.service');

let orderIdQuickReply = '';

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

	console.log("Received postback for user %d and page %d with payload '%s' " +
	"at %d", senderID, recipientID, payload, timeOfPostback);

	switch (payload) {
		case 'GET_STARTED_PAYLOAD':
		messenger.sendGreetingMessage(senderID);
		break;
		case 'PRODUCT_LIST_PAYLOAD':
		orderIdQuickReply = '';
		messenger.sendProductList(senderID);
		break;
		case 'BUY_FIZBONE_CL_70_PAYLOAD':
		messenger.sendQuickReplyOrderQuantity(senderID, "รับ ฟิซโบน ตับไก่ กี่ถุงดีคร้าบ");
		break;
		case 'BUY_FIZBONE_SM_50_PAYLOAD':
		messenger.sendQuickReplyOrderQuantity(senderID, "รับ ฟิซโบน แซลมอน กี่ถุงดีคร้าบ");
		break;
		default:
		// When a postback is called, we'll send a message back to the sender to
		// let them know it was successful
		messenger.sendTextMessage(senderID, "Postback called");
	}
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

	if (isEcho) {
		// Just logging message echoes to console
		console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
		return;
	} else if (quickReply) {
		var quickReplyPayload = quickReply.payload;
		console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
		messenger.sendTextMessage(senderID, "Quick reply tapped");
		return;
	}

	if (messageText) {

		// If we receive a text message, check to see if it matches any special
		// keywords and send back the corresponding example. Otherwise, just echo
		// the text we received.
		switch (messageText) {
			/*case 'image':
			sendImageMessage(senderID);
			break;

			case 'gif':
			sendGifMessage(senderID);
			break;

			case 'audio':
			sendAudioMessage(senderID);
			break;

			case 'video':
			sendVideoMessage(senderID);
			break;

			case 'file':
			sendFileMessage(senderID);
			break;

			case 'button':
			sendButtonMessage(senderID);
			break;

			case 'generic':
			sendGenericMessage(senderID);
			break;

			case 'receipt':
			sendReceiptMessage(senderID);
			break;

			case 'quick reply':
			sendQuickReply(senderID);
			break;

			case 'read receipt':
			sendReadReceipt(senderID);
			break;

			case 'typing on':
			sendTypingOn(senderID);
			break;

			case 'typing off':
			sendTypingOff(senderID);
			break;

			case 'account linking':
			sendAccountLinking(senderID);
			break;*/

			default:
			messenger.sendTextMessage(senderID, messageText + ' [bot]');
		}
	} else if (messageAttachments) {
		messenger.sendTextMessage(senderID, "Message with attachment received");
	}
};

module.exports = {
	verifyRequestSignature,
	verifyWebhook,
	webhook
}
