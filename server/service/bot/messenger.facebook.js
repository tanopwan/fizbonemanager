'use strict';

const request = require('request');
const config = require('../../config/facebookapi');
const ProductService = require('../product.service');

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
* Send a text message using the Send API.
*
*/
const sendTextMessage = (recipientId, messageText) => {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: `[ฟีนิกซ์] ${messageText}`
		}
	};

	callSendAPI(messageData);
}

/*
* Send a template message using the Send API.
*
*/
const sendTemplateMessageWithDelay = (recipientId, messageText, delay) => {
	if (delay) {
		setTimeout(() => sendTemplateMessage(recipientId, messageText), delay)
	}
	else {
		sendTemplateMessage(recipientId, messageText);
	}
}

/*
* Send a template message using the Send API.
*
*/
const sendTemplateMessage = (recipientId, payload) => {
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

	callSendAPI(messageData);
}

/*
* Call the Send API. The message data goes in the body. If successful, we'll
* get the message id in a response
*
*/
const callSendAPI = (messageData) => {
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
	appSecret: APP_SECRET,
	validationToken: VALIDATION_TOKEN,
	/*
	* Send a Product list
	*
	*/
	sendProductList: (session) => {
		ProductService.getOnlineProducts().then(resolve => {
			let products = resolve;
			let payload = {
				"template_type": "list",
				"top_element_style": "compact",
				"elements": []
			};
			if (products.length > 5) {
				products.splice(0, 5);
			}
			products.forEach(product => {
				payload.elements.push({
					"title": product.productName,
					"image_url": product.link,
					"subtitle": `ถุงละ ${product.price/100} บาท`,
					"buttons": [
						{
							"type": "postback",
							"title": "ซื้อเลย",
							"payload": `CUSTOM_BUY_${product._id}`
						}
					]
				});
			})
			sendTemplateMessage(session.senderID, payload);
		}).catch(resolve => {
			console.log(resolve);
		})

	},
	/*
	* Send a Product list
	*
	*/
	sendReceiptTemplate: (recipientId) => {
		sendTemplateMessage(recipientId, config.TEMPLATE_RECEIPT_PAYLOAD);
	},
	/*
	* Send Greeting Messages
	*
	*/
	sendGreetingMessage: (recipientId) => {
		sendTemplateMessage(recipientId, config.TEMPLATE_PHEONIX_GREETING_PAYLOAD);
		sendTextMessage(recipientId, "วิธีสังเกตุง่ายๆว่ากำลังคุยกับผมอยู่ ให้ดูที่ต้นประโยคจะเห็น [ฟีนิกซ์] ครับ", 1000);
		sendTemplateMessageWithDelay(recipientId, config.TEMPLATE_CHOICES_PAYLOAD, 2000);
	},
	sendShopMoreMessage: (recipientId, text, delay) => {
		if (!delay) {
			delay = 0;
		}
		sendTemplateMessageWithDelay(recipientId, {
			template_type: "button",
			text: `[ฟีนิกซ์] ${text}`,
			buttons: [
				{
					type: "postback",
					title: "สั่งเพิ่ม",
					payload: "PRODUCT_LIST_PAYLOAD"
				},
				{
					type: "postback",
					title: "ดูรายการที่สั่ง",
					payload: "ORDER_LIST_PAYLOAD"
				},
				{
					type: "postback",
					title: "เสร็จแล้ว",
					payload: "FINISHED_ORDER"
				}
			]
		}, delay);
	},
	/*
	* Send a message with Quick Reply buttons.
	*
	*/
	sendQuickReplyOrderQuantity: (recipientId, message, ref) => {
		var messageData = {
			recipient: {
				id: recipientId
			},
			message: {
				text: `[ฟีนิกซ์] ${message} (อ้างอิง: ${ref})`,
				quick_replies: [
					{
						"content_type": "text",
						"title": "1",
						"payload": `CUSTOM_Q_1_${ref}`
					},
					{
						"content_type": "text",
						"title": "2",
						"payload": `CUSTOM_Q_2_${ref}`
					},
					{
						"content_type": "text",
						"title": "3",
						"payload": `CUSTOM_Q_3_${ref}`
					},
					{
						"content_type": "text",
						"title": "4",
						"payload": `CUSTOM_Q_4_${ref}`
					},
					{
						"content_type": "text",
						"title": "5",
						"payload": `CUSTOM_Q_5_${ref}`
					},
					{
						"content_type": "text",
						"title": "6",
						"payload": `CUSTOM_Q_6_${ref}`
					}
				]
			}
		};

		callSendAPI(messageData);
	},
	/*
	* Send a text message using the Send API.
	*
	*/
	sendTextMessage: (recipientId, messageText, delay) => {
		if (delay) {
			setTimeout(() => sendTextMessage(recipientId, messageText), delay)
		}
		else {
			sendTextMessage(recipientId, messageText);
		}
	}
}
