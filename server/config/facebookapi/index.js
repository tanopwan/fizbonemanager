module.exports = {
	appSecret: "0aba4db811b17c20703c39429ff61e11",
	pageAccessToken: "EAAKKsI1xNOkBACZCbsskeP02b0NlIijrLIUfG7hWZBFhOuKU3jfyUAruBpvJZCHCHaB4ZA4OIZAHcysQ8DKKn1pf8Ccir7Sf6Bj8bj7FRZCVZASZCucmxnb92AZCKUNqw6Kke3IZC9fT5rOIylEPU94yxVPxnZCLdXszP7X8ZBn9VzmD9QZDZD",
	validationToken: "coconut",
	serverURL: "https://fizbonemanager.herokuapp.com",
	TEMPLATE_PHEONIX_GREETING_PAYLOAD: {
		"template_type":"generic",
		"elements":[
			{
				"title":"สวัสดีครับผมคือระบบตอบรับอัตโนมัติ ชื่อ ฟีนิกซ์",
				"image_url":"https://fizbonemanager.herokuapp.com/images/pheonix.jpg",
				"subtitle":"ถ้าไม่สนใจคุยกับผมรอสักครู่แม่ผมจะมาตอบนะครับ"
			}
		]
	},
	TEMPLATE_CHOICES_PAYLOAD: {
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
				"title":"ดูรายการสินค้า เพื่อสั่งซื้อ",
				"payload":"PRODUCT_LIST_PAYLOAD"
			}
		]
	},
	TEMPLATE_RECEIPT_PAYLOAD: {
		"template_type":"receipt",
		"recipient_name":"Stephane Crozatier",
		"order_number":"12345678902",
		"currency":"THB",
		"payment_method":"โอนผ่านบัญชีธนาคาร",
		//"order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
		"timestamp":"1428444852",
		"elements":[
			{
				"title":"Classic White T-Shirt",
				"subtitle":"100% Soft and Luxurious Cotton",
				"quantity":2,
				"price":50,
				"currency":"USD",
				"image_url":"https://fizbonemanager.herokuapp.com/images/salmon.jpg"
			}
		],
		"address":{
			"street_1":"1 Hacker Way",
			"street_2":"",
			"city":"Menlo Park",
			"postal_code":"94025",
			"state":"CA",
			"country":"US"
		},
		"summary":{
			"subtotal":75.00,
			"shipping_cost":4.95,
			"total_tax":6.19,
			"total_cost":56.14
		},
		"adjustments":[
			{
				"name":"New Customer Discount",
				"amount":20
			},
			{
				"name":"$10 Off Coupon",
				"amount":10
			}
		]
	}
}
