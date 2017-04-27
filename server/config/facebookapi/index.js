module.exports = {
	appSecret: "0aba4db811b17c20703c39429ff61e11",
	pageAccessToken: "EAAKKsI1xNOkBACZCbsskeP02b0NlIijrLIUfG7hWZBFhOuKU3jfyUAruBpvJZCHCHaB4ZA4OIZAHcysQ8DKKn1pf8Ccir7Sf6Bj8bj7FRZCVZASZCucmxnb92AZCKUNqw6Kke3IZC9fT5rOIylEPU94yxVPxnZCLdXszP7X8ZBn9VzmD9QZDZD",
	validationToken: "coconut",
	serverURL: "https://fizbonemanager.herokuapp.com",
	LIST_TEMPLATE_PRODUCTS: {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "list",
				"top_element_style": "compact",
				"elements": [
					{
						"title": "ฟิซโบน ตับไก่ 70 กรัม",
						"image_url": "https://fizbonemanager.herokuapp.com/images/chickenliver.jpg",
						"subtitle": "ถุงละ 189 บาท",
						"buttons": [
							{
								"type":"postback",
								"title":"ซื้อเลย",
								"payload":"BUY_FIZBONE_CL_70_PAYLOAD"
							}
						]
					},
					{
						"title": "ฟิซโบน แซลมอน 50 กรัม",
						"image_url": "https://fizbonemanager.herokuapp.com/images/salmon.png",
						"subtitle": "ถุงละ 189 บาท",
						"buttons": [
							{
								"type":"postback",
								"title":"ซื้อเลย",
								"payload":"BUY_FIZBONE_SM_50_PAYLOAD"
							}
						]
					},
				],
			}
		}
	},
	QUICK_REPLES_QUANTITY: [
		{
			"content_type":"text",
			"title":"1",
			"payload":"ONE_QUANTITY"
		},
		{
			"content_type":"text",
			"title":"2",
			"payload":"TWO_QUANTITY"
		},
		{
			"content_type":"text",
			"title":"3",
			"payload":"THREE_QUANTITY"
		},
		{
			"content_type":"text",
			"title":"4",
			"payload":"FOUR_QUANTITY"
		},
		{
			"content_type":"text",
			"title":"5+",
			"payload":"FIVE_QUANTITY"
		}
	]
}
