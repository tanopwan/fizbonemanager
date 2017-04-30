'use strict';

const path = require('path');
const facebookBot = require('./service/bot/facebook');
const bodyParser = require('body-parser');
const base64url = require('base64-url');

module.exports = function(app) {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.post('/shipping-address', function(req, res) {
		console.log(req.body);
		let signedRequest = req.body.signed_request;
		if (signedRequest) {
			let signedData = signedRequest.split('.');
			let hash = base64url.decode(signedRequest[0]);
			let data = base64url.decode(signedRequest[1]);
			console.log(hash);
			console.log(data);

			res.sendFile(path.resolve(`${__dirname}/views/thank-you.html`));
		}
		else {
			res.sendFile(path.resolve(`${__dirname}/views/error.html`));
		}
	});
	app.use(bodyParser.json());
	app.use('/api/auth', require('./auth').facebookRouter);
	app.use('/api/users', require('./api/user'));
	app.use('/api/products', require('./api/product'));
	app.use('/api/batches', require('./api/batch'));
	app.use('/api/promotions', require('./api/promotion'));
	app.use('/api/customers', require('./api/customer'));
	app.use('/api/sales', require('./api/sale'));
	app.use('/login', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/login.html`));
	});
	app.use('/facebook-messenger/shipping-address', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/shipping-address.html`));
	});

	app.get('/webhook', bodyParser.json({ verify: facebookBot.verifyRequestSignature }), facebookBot.verifyWebhook);
	app.post('/webhook', bodyParser.json({ verify: facebookBot.verifyRequestSignature }), facebookBot.webhook);

	// Below all routes
	app.use((req, res) => {
		res.redirect('/');
	});
}
