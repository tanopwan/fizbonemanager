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

/*
* Send a Product list
*
*/
const sendProductList = (session) => {
	ProductService.getOnlineProducts().then(resolve => {
		let products = resolve;
		console.log("All products " + JSON.stringify(products));
		let payload = {
			"template_type": "list",
			"top_element_style": "compact",
			"elements": []
		};
		if (products.length > 5) {
			products = products.splice(0, 5);
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
		});
		console.log(payload);
		sendTemplateMessage(session.senderID, payload);
	}).catch(resolve => {
		console.log(resolve);
	})
};

/*
* Send an image using the Send API.
*
*/
function sendImageMessage(recipientId, url) {
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

	callSendAPI(messageData);
}

/*
* Send a Receipt
*
*/
const sendReceiptTemplate = (session) => {
	let payload = {
		"template_type": "receipt",
		"recipient_name": "Stephane Crozatier",
		"order_number": "12345678902",
		"currency": "THB",
		"payment_method": "โอนเงินผ่านบัญชีธนาคาร",
		//"order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
		//"timestamp": "1428444852",
		"elements":[],
		"summary":{
			"subtotal": 0.00,
			"shipping_cost": 0.00,
			"total_cost": 0.00
		}
	};
	payload.recipient_name = "name";
	payload.order_number = "ref1234";
	let subtotal = 0.00;
	if (session.orders) {
		session.orders.forEach(order => {
			subtotal = subtotal + (order.price * order.q);
			payload.elements.push({
				title: order.productName,
				subtitle: "ขนมสุนัข ธรรมชาติ 100%",
				quantity: order.q,
				price: order.price / 100,
				currency: "THB",
				image_url: order.link
			});
		})
	}

	if (session.address) {
		payload.address = {
			street_1: session.address.street_1,
			street_2: session.address.street_2,
			city: session.address.city,
			postal_code: session.address.postal_code,
			state: session.address.state,
			country: "ประเทศไทย"
		}
	}

	//payload.address = null;
	payload.summary.subtotal = subtotal / 100;
	payload.summary.total_cost = subtotal / 100;
	sendTemplateMessage(session.senderID, payload);
	sendShopMoreMessage(session, 500);
};

/*
* Send Greeting Messages
*
*/
const sendGreetingMessage = (recipientId) => {
	sendTemplateMessage(recipientId, config.TEMPLATE_PHEONIX_GREETING_PAYLOAD);
	sendTextMessage(recipientId, "วิธีสังเกตุง่ายๆว่ากำลังคุยกับผมอยู่ ให้ดูที่ต้นประโยคจะเห็น [ฟีนิกซ์] ครับ", 1000);
	sendTemplateMessageWithDelay(recipientId, config.TEMPLATE_CHOICES_PAYLOAD, 2000);
};

const sendShopMoreMessage = (session, delay) => {
	if (!delay) {
		delay = 0;
	}
	let checkoutMessage = "ขั้นตอนต่อไป";
	let checkoutPayload = "CHECK_OUT_ADDRESS";
	if (session.address && session.address.street_1 && session.address.street_2 && session.address.city && session.address.postal_code && session.address.state) {
		checkoutMessage = "ไปชำระเงิน";
		checkoutPayload = "CHECK_OUT";
	}

	sendTemplateMessageWithDelay(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] สั่งอะไรเพิ่มมั้ยคร้าบ?`,
		buttons: [
			{
				type: "postback",
				title: "สั่งเพิ่ม",
				payload: "PRODUCT_LIST_PAYLOAD"
			},
			{
				type: "postback",
				title: "ดูสินค้าในตระกร้า",
				payload: "ORDER_LIST_PAYLOAD"
			},
			/*{
				type: "postback",
				title: checkoutMessage,
				payload: checkoutPayload
			},*/
			{
				"title": "ระบุที่อยู่จัดส่ง",
				"type": "web_url",
				"url": "https://f9a2341c.ngrok.io/facebook-messenger/shipping-address",
				"messenger_extensions": true,
				"webview_height_ratio": "tall"
			}
		]
	}, delay);
};

/*
* Send a message with Quick Reply buttons.
*
*/
const sendQuickReplyOrderQuantity = (recipientId, message, ref) => {
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
};

/*
* Send a text message using the Send API.
*
*/
const sendTextMessage = (recipientId, messageText, delay) => {
	if (delay) {
		setTimeout(() => sendTextMessage(recipientId, messageText), delay)
	}
	else {
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
};

const sendAskForPostalCode = (session) => {
	if (session.status && session.status.name === 'retrieving_address' && session.status.substatus === 'postal_code') {
		session.status.try++;
	}
	else {
		session.status = {
			name: 'retrieving_address',
			substatus: 'postal_code',
			try: 1
		}
	}

	if (session.status.try === 1) {
		let msg = `1. กรุณาระบุรหัสไปรษณีย์ 5 หลักครับผม try(${session.status.try})`;
		setTimeout(() => sendTextMessage(session.senderID, msg), 500);
	}
	else if (session.status.try <= 3) {
		let msg = `1. กรุณาระบุรหัสไปรษณีย์ 5 หลักครับผม (ให้พิมพ์แค่ตัวเลข 5 หลัก เช่น 10150)  try(${session.status.try})`;
		sendTextMessage(session.senderID, msg);
	}
	else {
		//TODO alert shop
		sendTextMessage(session.senderID, "ผมไม่เข้าใจครับ กรุณารอแม่ผมมาช่วยหน่อยนะครับ");
		session.status = {
			name: '',
			substatus: '',
			try: 0
		}
	}
};

const sendPostalCodeResult = (session, delay) => {
	if (!delay) {
		delay = 0;
	}
	if (session.address) {
		sendTemplateMessageWithDelay(session.senderID, {
			template_type: "button",
			text: `[ฟีนิกซ์] โปรดเช็คความถูกต้อง\n รหัสไปรษณีย์: ${session.address.postal_code}\n จังหวัด: ${session.address.state}\n เขต: ${session.address.city}`,
			buttons: [
				{
					type: "postback",
					title: "ถูกต้อง",
					payload: "ENTER_SUB_DISTRICT"
				},
				{
					type: "postback",
					title: "ต้องการแก้ไข",
					payload: "ENTER_POSTAL_CODE"
				},
				{
					type: "postback",
					title: "ไม่ถูกต้อง ติดต่อแม่ฟีนิกซ์",
					payload: "CHOICE_PERSON"
				}
			]
		}, delay);
	}
};

const sendAskForSubDistrict = (session, try_) => {
	if (!try_) {
		session.status = {
			name: 'retrieving_address',
			substatus: 'sub_district',
			try: 1
		}
	}

	let msg = `2. กรุณาระบุแขวงคร้าบ try(${session.status.try})`;
	setTimeout(() => sendTextMessage(session.senderID, msg), 500);
};

const sendSuggestedSubdistricts = (session, suggested) => {
	if (session.status && session.status.name === 'retrieving_address' && session.status.substatus === 'sub_district') {
		session.status.try++;
	}

	let buttons = [];
	suggested.forEach(suggest => {
		buttons.push({
			type: "postback",
			title: suggest.subD,
			payload: `CUSTOM_SUBD_${suggest.subD}`
		});
	})
	if (session.status.try > 3) {
		buttons.push({
			type: "postback",
			title: "ไม่ถูกต้อง ติดต่อแม่ฟีนิกซ์",
			payload: "CHOICE_PERSON"
		});
	}
	else {
		buttons.push({
			type: "postback",
			title: "ลองพิมพ์ใหม่",
			payload: "sendAskForSubDistrict"
		});
	}

	sendTemplateMessage(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] พิมพ์ผิดรึเปล่าครับ ผมคิดว่าน่าจะเป็นตามตัวเลือกด้านล่างนะค้าบ  try(${session.status.try})`,
		buttons: buttons
	});
}

const sendSubDistrictResult = (session) => {
	if (session.address) {
		sendTemplateMessage(session.senderID, {
			template_type: "button",
			text: `[ฟีนิกซ์] โปรดเช็คความถูกต้อง\n เขต: ${session.address.city}\n แขวง: ${session.address.street_2}`,
			buttons: [
				{
					type: "postback",
					title: "ถูกต้อง",
					payload: "ENTER_ADDRESS"
				},
				{
					type: "postback",
					title: "ต้องการแก้ไข",
					payload: "ENTER_SUB_DISTRICT"
				},
				{
					type: "postback",
					title: "ไม่ถูกต้อง ติดต่อแม่ฟีนิกซ์",
					payload: "CHOICE_PERSON"
				}
			]
		});
	}
}

const sendAskForAddress = (session) => {
	session.status = {
		name: 'retrieving_address',
		substatus: 'address',
		try: 1
	}

	let msg = `3. สุดท้ายละครับ กรุณาพิมพ์ บ้านเลขที่, อาคาร, ซอย, ถนน try(${session.status.try})`;
	setTimeout(() => sendTextMessage(session.senderID, msg), 100);
}

const sendAddressResult = (session) => {
	if (session.address) {
		sendTemplateMessageWithDelay(session.senderID, {
			template_type: "button",
			text: `[ฟีนิกซ์] โปรดเช็คความถูกต้อง\n ${session.address.street_1}\n${session.address.street_2} ${session.address.city}\n${session.address.state} ${session.address.postal_code}`,
			buttons: [
				{
					type: "postback",
					title: "ถูกต้อง",
					payload: "ORDER_LIST_PAYLOAD"
				},
				{
					type: "postback",
					title: "ต้องการแก้ไข",
					payload: "ENTER_ADDRESS"
				},
				{
					type: "postback",
					title: "ไม่ถูกต้อง ติดต่อแม่ฟีนิกซ์",
					payload: "CHOICE_PERSON"
				}
			]
		});
	}
}

const sendMenuMessage = (recipientId, delay) => {
	sendTemplateMessageWithDelay(recipientId, config.TEMPLATE_CHOICES_PAYLOAD, delay);
}

const sendPaymentMethod = (session) => {
	sendImageMessage(session.senderID, 'https://firebasestorage.googleapis.com/v0/b/fizbone-manager.appspot.com/o/%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B8%B3%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99.jpg?alt=media&token=af27325d-8120-46d1-9259-e2026c0bae46')
}

module.exports = {
	appSecret: APP_SECRET,
	validationToken: VALIDATION_TOKEN,
	sendProductList,
	sendReceiptTemplate,
	sendGreetingMessage,
	sendShopMoreMessage,
	sendQuickReplyOrderQuantity,
	sendTextMessage,
	sendAskForPostalCode,
	sendPostalCodeResult,
	sendAskForSubDistrict,
	sendSuggestedSubdistricts,
	sendSubDistrictResult,
	sendAskForAddress,
	sendAddressResult,
	sendMenuMessage,
	sendPaymentMethod
}
