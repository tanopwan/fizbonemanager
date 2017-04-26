'use strict';

const config = require('../../../config/facebookapi');
const request = require('request');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) || config.appSecret;

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) || config.validationToken;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) || config.pageAccessToken;

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) || config.serverURL;

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
	console.error("Missing config values");
	process.exit(1);
}

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

		var expectedHash = crypto.createHmac('sha1', APP_SECRET)
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
	req.query['hub.verify_token'] === VALIDATION_TOKEN) {
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
function receivedMessage(event) {
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
		sendTextMessage(senderID, "Quick reply tapped");
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
			sendTextMessage(senderID, messageText + ' [bot]');
		}
	} else if (messageAttachments) {
		sendTextMessage(senderID, "Message with attachment received");
	}
}

/*
* Postback Event
*
* This event is called when a postback is tapped on a Structured Message.
* https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
*
*/
function receivedPostback(event) {
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
		sendTextMessage(senderID, "สวัสดีครับผมคือระบบตอบรับอัตโนมัติ ชื่อ ฟีนิกซ์ ถ้าไม่สนใจคุยกับผมรอสักครู่แม่ผมจะมาตอบนะครับ");
		sendTextMessage(senderID, "วิธีสังเกตุง่ายๆว่ากำลังคุยกับผมอยู่ ให้ดูที่ต้นประโยคจะเห็น [ฟีนิกซ์] ครับ");
		break;
		case 'PRODUCT_LIST_PAYLOAD':
		sendProductList(senderId);
		break;
		default:
		// When a postback is called, we'll send a message back to the sender to
		// let them know it was successful
		sendTextMessage(senderID, "Postback called");
	}
}

/*
* Send a Product list
*
*/
function sendProductList(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			"attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
            "elements": [
                {
                    "title": "ฟิซโบน ตับไก่ 70 กรัม",
                    "image_url": "https://fizbonemanager.herokuapp.com/images/chickenliver.jpg",
                    "subtitle": "ถุงละ 189 บาท",
                    "default_action": {
						"type": "postback",
                    	"payload": "BUY_FIZBONE_CL_70_PAYLOAD"
                    }
                },
				{
                    "title": "ฟิซโบน แซลมอน 50 กรัม",
                    "image_url": "https://fizbonemanager.herokuapp.com/images/salmon.png",
                    "subtitle": "ถุงละ 189 บาท",
                    "default_action": {
						"type": "postback",
                    	"payload": "BUY_FIZBONE_SM_50_PAYLOAD"
                    }
                },
            ],
             "buttons": [
                {
                    "title": "View More",
                    "type": "postback",
                    "payload": "payload"
                }
            ]
		}
	};

	callSendAPI(messageData);
}

/*
* Send a text message using the Send API.
*
*/
function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: `[ฟีนิกซ์] ${messageText}`,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};

	callSendAPI(messageData);
}

/*
* Call the Send API. The message data goes in the body. If successful, we'll
* get the message id in a response
*
*/
function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			if (messageId) {
				console.log("Successfully sent message with id %s to recipient %s",
				messageId, recipientId);
			} else {
				console.log("Successfully called Send API for recipient %s",
				recipientId);
			}
		} else {
			console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
		}
	});
}

module.exports = {
	verifyRequestSignature,
	verifyWebhook,
	webhook
}
