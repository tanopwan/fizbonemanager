'use strict';

const fbMessenger = require('./fbmessenger');
const productService = require('../product.service');

/*
* Send a Product list (Online Products)
*
*/
const sendProductList = (session) => {
	return productService.getOnlineProducts().then(resolve => {
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
				"title": product._id,
				"image_url": product.link,
				"subtitle": `ถุงละ ${(product.price/100).toFixed(2)} บาท`,
				"buttons": [
					{
						"type": "postback",
						"title": "ซื้อเลย",
						"payload": `CUSTOM_BUY_${product._id}_${product.batchId}`
					}
				]
			});
		});
		fbMessenger.sendTemplateMessage(session.senderID, payload);
		return Promise.resolve();
	}).catch(reject => {
		console.log(reject);
		return Promise.reject();
	});
};

/*
* Send a Order list (Order Items)
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
	fbMessenger.sendTextMessage(session.senderID, text);
};

/*
* Send a Receipt
*
*/
const sendReceipt = (session, order) => {
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
	fbMessenger.sendTemplateMessage(session.senderID, payload);
};

/*
* Send Greeting Messages
*
*/
const sendGreeting = (recipientId) => {
	fbMessenger.sendTemplateMessage(recipientId, {
		"template_type":"generic",
		"elements":[
			{
				"title":"สวัสดีครับผมคือระบบตอบรับอัตโนมัติ ชื่อ ฟีนิกซ์",
				"image_url":"https://fizbonemanager.herokuapp.com/images/pheonix.jpg",
				"subtitle":"ถ้าไม่สนใจคุยกับผมรอสักครู่แม่ผมจะมาตอบนะครับ"
			}
		]
	});
	fbMessenger.sendTextMessage(recipientId, "วิธีสังเกตุง่ายๆว่ากำลังคุยกับผมอยู่ ให้ดูที่ต้นประโยคจะเห็น [ฟีนิกซ์] ครับ", 1000);
};

/*
* Send Menu for shop more message
*/
const sendShopMore = (session, showOrderListPayload, delay) => {
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

	fbMessenger.sendTemplateMessage(session.senderID, {
		template_type: "button",
		text: `[ฟีนิกซ์] สั่งอะไรเพิ่มมั้ยคร้าบ?`,
		buttons
	}, delay);
};

/*
* Send confirm finish order message (CHECK_OUT or DELETE_ALL_ORDERS)
*/
const sendConfirmFinishOrder = (session, delay) => {
	fbMessenger.sendTemplateMessage(session.senderID, {
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

	fbMessenger.callSendAPI(messageData);
};

/*
* Send a message to tell user that slip is veried and ready to ship
*
*/
const sendReadyToShip = (recipientId, orderId) => {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: `[ฟีนิกซ์] ขอบคุณสำหรับการสั่งซื้อคร้าบ ผมกำลังช่วยแม่เตรียมสินค้า ซึ่งจะพยายามไม่กินขนมลูกค้านะครับ ยังไงจะแจ้งความคืบหน้าเป็นระยะครับผม (คำสั่งซื้อเลขที่: ${orderId})`
		},
		tag: "SHIPPING_UPDATE"
	};

	fbMessenger.callSendAPI(messageData);
};

/*
* Send a message to ask user to open webview in order to save address
*
*/
const sendAskForAddress = (session) => {
	fbMessenger.sendTemplateMessage(session.senderID, {
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

/*
* Send a address result
*/
const sendAddressResult = (session) => {
	let address = session.customer.address;
	fbMessenger.sendTemplateMessage(session.senderID, {
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

/*
* Send a Main Menu (PRODUCT_LIST_PAYLOAD and CHOICE_PERSON)
*/
const sendMainMenu = (recipientId, delay) => {
	fbMessenger.sendTemplateMessage(recipientId, {
		"template_type":"button",
		"text":"ผมจะช่วยเท่าที่จะช่วยได้คร้าบ ถ้าสั่งซื้อขนม ผมทำได้ดีเลยค้าบ",
		"buttons":[
			{
				"type":"postback",
				"title":"รอคุยกับแม่ฟีนิกซ์",
				"payload":"CHOICE_PERSON"
			},
			{
				"type":"postback",
				"title":"ดูรายการสินค้า",
				"payload":"PRODUCT_LIST_PAYLOAD"
			}
		]
	}, delay);
}

/*
* Send a payment method (image KBank)
*/
const sendPaymentMethod = (session, delay) => {

	setTimeout(() => fbMessenger.sendTextMessage(session.senderID, "ลูกค้าสามารถโอนเงินได้ตามช่องทางด้านล่างเลยคร้าบ"), delay);
	setTimeout(() => fbMessenger.sendImageMessage(session.senderID, 'https://firebasestorage.googleapis.com/v0/b/fizbone-manager.appspot.com/o/%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B8%B3%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99.jpg?alt=media&token=af27325d-8120-46d1-9259-e2026c0bae46'), delay);
	setTimeout(() => fbMessenger.sendTextMessage(session.senderID, "หลังจากส่งสลิปการโอนเงินแล้ว รอระบบยืนยัน เพื่อจัดส่งสินค้าต่อไปคร้าบ"), delay + 1000);
}

const sendText = (recipientId, messageText, delay) => {
	fbMessenger.sendTextMessage(recipientId, messageText, delay);
}

module.exports = {
	sendProductList,
	sendOrderList,
	sendReceipt,
	sendGreeting,
	sendShopMore,
	sendQuickReplyOrderQuantity,
	sendAskForAddress,
	sendAddressResult,
	sendMainMenu,
	sendPaymentMethod,
	sendReadyToShip,
	sendText
}
