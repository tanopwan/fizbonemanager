'use strict';

const request = require('request');
const config = require('../../config/facebookapi');

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
const verifyWebhook = function (req, res) {
	console.log("Verify Webhook");
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
* Send a text message using the Send API.
*
*/
const sendTextMessage = (recipientId, messageText, delay) => {
	if (!delay) {
		delay = 0;
	}
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: `[ฟีนิกซ์] ${messageText}`
		}
	};

	setTimeout(() => callSendAPI(messageData), delay);
};

/*
* Send an image using the Send API.
*
*/
function sendImageMessage(recipientId, url, delay) {
	if (!delay) {
		delay = 0;
	}

	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "image",
				payload: {
					url: url
				}
			}
		}
	};

	setTimeout(() => callSendAPI(messageData), delay);
}

/*
* Send a template message using the Send API.
*
*/
const sendTemplateMessage = (recipientId, payload, delay) => {
	if (!delay) {
		delay = 0;
	}
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			"attachment": {
				"type": "template",
				"payload": payload
			}
		}
	};
	setTimeout(() => callSendAPI(messageData), delay);
}

/*
* Call the Send API. The message data goes in the body. If successful, we'll
* get the message id in a response
*
*/
const callSendAPI = (messageData) => {
	console.log("---request start---\n" + JSON.stringify(messageData) + "\n---request end---");
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
				console.log("++++++Successfully sent message with id %s to recipient %s",
					messageId, recipientId);
			} else {
				console.log("++++++Successfully called Send API for recipient %s",
					recipientId);
			}
		} else {
			console.error("++++++Failed calling Send API", response.statusCode, response.statusMessage, body.error);
		}
	});
}

module.exports = {
	callSendAPI,
	sendTextMessage,
	sendImageMessage,
	sendTemplateMessage,
	verifyRequestSignature,
	verifyWebhook
}
