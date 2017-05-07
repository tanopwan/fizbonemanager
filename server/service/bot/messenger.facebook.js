'use strict';

const request = require('request');
const config = require('../../config/facebookapi');
const ProductService = require('../product.service');
const CustomerService = require('../customer.service');

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
				console.log("++++++Successfully sent message with id %s to recipient %s",
				messageId, recipientId);
			} else {
				console.log("++++++Successfully called Send API for recipient %s",
				recipientId);
			}
		} else {
			console.error("++++++Failed calling Send API", response.statusCode, response.statusMessage, body.error);
		}
		console.log("------\n" + JSON.stringify(messageData) + "\n------");
	});
}

/*
* Send a Product list
*
*/
const sendProductList = (session) => {
	ProductService.getOnlineProducts().then(resolve => {
		let products = resolve;
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
						"payload": `CUSTOM_BUY_${product._id}_${product.batchId}`
					}
				]
			});
		});
		sendTemplateMessage(session.senderID, payload);
	}).catch(resolve => {
		console.log(resolve);
	})
};

/*
* Send a Order list
*
*/
const sendOrderList = (session) => {
	let text = `คุณมีสินค้า ${session.items.length} รายการ อยู่ในตระกร้า\n`;
	let count = 1;
	let sum = 0;
	session.items.forEach(order => {
		text = text + `${count}. ${order.product.name}\nจำนวน ${order.quantity} รวมเป็นเงิน ${(order.price / 100 * order.quantity).toFixed(2)} บาท\n`;
		count++;
		sum += (order.price / 100 * order.quantity);
	});
	text = text + `ยอดรวม ${sum.toFixed(2)} บาท`;
	sendTextMessage(session.senderID, text);
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
const sendReceiptTemplate = (session, order) => {
	let payload = {
		"template_type": "receipt",
		"order_number": order._id,
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

	let subtotal = 0.00;
	if (session.items) {
		session.items.forEach(order => {
			subtotal = subtotal + (order.price * order.quantity);
			payload.elements.push({
				title: order.product.name,
				subtitle: "ขนมสุนัข ธรรมชาติ 100%",
				quantity: order.quantity,
				price: order.price / 100,
				currency: "THB",
				image_url: order.product.link
			});
		})
	}

	let address = session.customer.address;
	if (address
		&& address.name
		&& address.street
		&& address.subDistrict
		&& address.district
		&& address.province
		&& address.postalCode
	) {
		payload.recipient_name = address.name;
		payload.address = {
			street_1: address.street,
			street_2: address.subDistrict,
			city: address.district,
			state: address.province,
			postal_code: address.postalCode,
			country: "ประเทศไทย"
		};
	}

	payload.summary.subtotal = subtotal / 100;
	payload.summary.total_cost = subtotal / 100;

	session.items = [];
	sendTemplateMessage(session.senderID, payload);
};

/*
* Send Greeting Messages
*
*/
const sendGreetingMessage = (recipientId) => {
	sendTemplateMessage(recipientId, config.TEMPLATE_PHEONIX_GREETING_PAYLOAD);
	sendTextMessage(recipientId, "วิธีสังเกตุง่ายๆว่ากำลังคุยกับผมอยู่ ให้ดูที่ต้นประโยคจะเห็น [ฟีนิกซ์] ครับ", 1000);
	sendTemplateMessageWithDelay(recipientId, config.TEMPLATE_CHOICES_PAYLOAD, 1500);
};

const sendShopMoreMessage = (session, showOrderListPayload, delay) => {
	if (!delay) {
		delay = 0;
	}
	let buttons = [
		{
			type: "postback",
			title: "สั่งเพิ่ม",
			payload: "PRODUCT_LIST_PAYLOAD"
		},
		{
			type: "postback",
			title: "ไปขั้นตอน จัดส่ง",
			payload: "CHECK_OUT_ADDRESS"
		}
	];

	if (showOrderListPayload) {
		buttons.push({
			type: "postback",
			title: "ดูสินค้าในตระกร้า",
			payload: "ORDER_LIST_PAYLOAD"
		});
	}

	sendTemplateMessageWithDelay(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] สั่งอะไรเพิ่มมั้ยคร้าบ?`,
		buttons
	}, delay);
};

const sendConfirmFinishOrderMessage = (session, delay) => {
	if (!delay) {
		delay = 0;
	}

	sendTemplateMessageWithDelay(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] ตรวจสอบความถูกต้องด้วยครับ`,
		buttons: [
			{
				type: "postback",
				title: "ถูกต้อง สั่งเลย",
				payload: "CHECK_OUT"
			},
			{
				type: "postback",
				title: "ไม่ถูกต้อง เริ่มใหม่",
				payload: "DELETE_ALL_ORDERS"
			},
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
		setTimeout(() => sendTextMessage(recipientId, messageText), delay);
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

const sendReadyToShipMessage = (recipientId, orderId) => {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: `[ฟีนิกซ์] ขอบคุณสำหรับการสั่งซื้อคร้าบ ผมกำลังช่วยแม่เตรียมสินค้า ซึ่งจะพยายามไม่กินขนมลูกค้านะครับ ยังไงจะแจ้งความคืบหน้าเป็นระยะครับผม (คำสั่งซื้อเลขที่: ${orderId})`
		},
		tag: "SHIPPING_UPDATE"
	};

	callSendAPI(messageData);
};

const sendAskForAddress = (session) => {
	sendTemplateMessageWithDelay(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] รบกวนขอที่อยู่จัดส่งด้วยครับผม`,
		buttons: [
			{
				"title": "ใส่ที่อยู่จัดส่ง",
				"type": "web_url",
				"url": `https://f9a2341c.ngrok.io/facebook-messenger/shipping-address`,
				"messenger_extensions": true,
				"webview_height_ratio": "tall"
			},
			{
				type: "postback",
				title: "ขอให้แม่ฟีนิกซ์ช่วย",
				payload: "CHOICE_PERSON"
			}
		]
	});
}

const sendAddressResult = (session) => {
	let address = session.customer.address;
	sendTemplateMessageWithDelay(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] ที่อยู่จัดส่ง\n คุณ ${address.name}\n ${address.street}\n${address.subDistrict} ${address.district}\n${address.province} ${address.postalCode}`,
		buttons: [
			{
				type: "postback",
				title: "ถูกต้อง",
				payload: "CONFIRM_ADDRESS"
			},
			{
				"title": "ต้องการแก้ไข",
				"type": "web_url",
				"url": `https://f9a2341c.ngrok.io/facebook-messenger/shipping-address`,
				"messenger_extensions": true,
				"webview_height_ratio": "tall"
			},
			{
				type: "postback",
				title: "ไม่ถูกต้อง ติดต่อแม่ฟีนิกซ์",
				payload: "CHOICE_PERSON"
			}
		]
	});
}

const sendMenuMessage = (recipientId, delay) => {
	sendTemplateMessageWithDelay(recipientId, config.TEMPLATE_CHOICES_PAYLOAD, delay);
}

const sendPaymentMethod = (session, delay) => {
	if (!delay) {
		delay = 0;
	}

	setTimeout(() => {
		sendTextMessage(session.senderID, "ลูกค้าสามารถโอนเงินได้ตามช่องทางด้านล่างเลยคร้าบ");
		sendImageMessage(session.senderID, 'https://firebasestorage.googleapis.com/v0/b/fizbone-manager.appspot.com/o/%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B8%B3%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99.jpg?alt=media&token=af27325d-8120-46d1-9259-e2026c0bae46')
		sendTextMessage(session.senderID, "หลังจากส่งสลิปการโอนเงินแล้ว รอระบบยืนยัน เพื่อจัดส่งสินค้าต่อไปคร้าบ", 1000);
	}, delay);
}

module.exports = {
	appSecret: APP_SECRET,
	validationToken: VALIDATION_TOKEN,
	sendProductList,
	sendOrderList,
	sendReceiptTemplate,
	sendGreetingMessage,
	sendShopMoreMessage,
	sendQuickReplyOrderQuantity,
	sendTextMessage,
	sendAskForAddress,
	sendAddressResult,
	sendMenuMessage,
	sendPaymentMethod,
	sendReadyToShipMessage
}
