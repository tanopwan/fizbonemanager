var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

// Test service
var fbmessengerService = require('../server/service/bot/fbmessenger.service');

// Stub & Mock
var fbmessenger = require('../server/service/bot/fbmessenger');
var productService = require('../server/service/product.service');

describe('fbmessenger.service.test', function() {
	let sendTemplateMessageStub = null;
	beforeEach(function(){
		sendTemplateMessageStub = sinon.stub(fbmessenger, "sendTemplateMessage").callsFake((recipientId, messageData) => {
			console.log("recipientId: " + recipientId);
			console.log(messageData);
			return;
		});
	});

	afterEach(function(){
		sendTemplateMessageStub.restore();
	});

	it('sendProductList() success with 2 items', function(done) {
		let productServiceStub = sinon.stub(productService, "getOnlineProducts")
		.resolves([
			{
				_id: 'ฟิซโบน แซลมอน 50 g.',
				link: null,
				price: 15000,
				batchId: '590ef3c57f48a7ec91eaf956',
				promotionId: '59102c540f2de73a578a5cb5'
			},
			{
				_id: 'ฟิซโบน ตับไก่ 70 g.',
				link: null,
				price: 15000,
				batchId: '59102c690f2de73a578a5cb6',
				promotionId: '59102c740f2de73a578a5cb7'
			}
		]);

		fbmessengerService.sendProductList({ senderID: '123' }).then(resolve => {
			sinon.assert.calledWith(sendTemplateMessageStub, '123', {
				"template_type": "list",
				"top_element_style": "compact",
				"elements": [
					{
						"title": "ฟิซโบน แซลมอน 50 g.",
						"image_url": null,
						"subtitle": "ถุงละ 150.00 บาท",
						"buttons": [
							{
								"type": "postback",
								"title": "ซื้อเลย",
								"payload": "CUSTOM_BUY_ฟิซโบน แซลมอน 50 g._590ef3c57f48a7ec91eaf956"
							}
						]
					},
					{
						"title": "ฟิซโบน ตับไก่ 70 g.",
						"image_url": null,
						"subtitle": "ถุงละ 150.00 บาท",
						"buttons": [
							{
								"type": "postback",
								"title": "ซื้อเลย",
								"payload": "CUSTOM_BUY_ฟิซโบน ตับไก่ 70 g._59102c690f2de73a578a5cb6"
							}
						]
					}
				]
			});
			productServiceStub.restore();
			done();
		});
	});

	it('sendProductList() failed', function(done) {
		let productServiceStub = sinon.stub(productService, "getOnlineProducts")
		.rejects();

		fbmessengerService.sendProductList({ senderID: '123' }).catch(reject => {
			productServiceStub.restore();
			done();
		});
	});

	it('sendMainMenu() success', function(done){
		let recipientId = '123';
		fbmessengerService.sendMainMenu(recipientId);
		sinon.assert.calledWith(sendTemplateMessageStub, recipientId, {
			"template_type": "button",
			"text": "ผมจะช่วยเท่าที่จะช่วยได้คร้าบ ถ้าสั่งซื้อขนม ผมทำได้ดีเลยค้าบ",
			"buttons": [
				{
					"type": "postback",
					"title": "รอคุยกับแม่ฟีนิกซ์",
					"payload": "CHOICE_PERSON"
				},
				{
					"type": "postback",
					"title": "ดูรายการสินค้า",
					"payload": "PRODUCT_LIST_PAYLOAD"
				}
			]
		});
		done();
	});

});
